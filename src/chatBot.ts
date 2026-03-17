import { ScamKeywordModel, ScamLogModel, ScamUrlModel } from './db.js';

const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

function resolveKeywordCacheTtlMs(): number {
	const raw = process.env.KEYWORD_CACHE_TTL_MS;
	const parsed = Number(raw);

	if (!Number.isFinite(parsed) || parsed <= 0) {
		return 60_000;
	}

	return Math.floor(parsed);
}

const KEYWORD_CACHE_TTL_MS = resolveKeywordCacheTtlMs();

type KeywordCache = {
	keywords: string[];
	matcher: RegExp | null;
	loadedAt: number;
	refreshInFlight: Promise<string[]> | null;
};

const keywordCache: KeywordCache = {
	keywords: [],
	matcher: null,
	loadedAt: 0,
	refreshInFlight: null
};

type ScamDetectionResult = {
	isSuspected: boolean;
	riskScore: number;
	matchedKeywords: string[];
	detectedUrls: string[];
};

function extractUrls(input: string): string[] {
	const matches = input.match(URL_REGEX) || [];
	return Array.from(new Set(matches.map((url) => url.trim().toLowerCase())));
}

function findMatchedKeywords(input: string, keywords: string[]): string[] {
	const normalized = input.toLowerCase().trim();
	const matcher = keywordCache.matcher;

	if (!matcher) {
		return keywords.filter((keyword) => normalized.includes(keyword));
	}

	matcher.lastIndex = 0;
	const matchedSet = new Set<string>();
	let match: RegExpExecArray | null = null;

	while ((match = matcher.exec(normalized)) !== null) {
		const matchedKeyword = match[0]?.trim();
		if (matchedKeyword) matchedSet.add(matchedKeyword);
	}

	return Array.from(matchedSet);
}

function calculateRiskScore(matchedKeywords: string[], detectedUrls: string[]): number {
	const keywordScore = matchedKeywords.length * 15;
	const urlScore = detectedUrls.length * 25;
	return Math.min(keywordScore + urlScore, 100);
}

function escapeRegex(input: string): string {
	return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildKeywordMatcher(keywords: string[]): RegExp | null {
	if (!keywords.length) return null;
	const sorted = [...keywords].sort((a, b) => b.length - a.length);
	const pattern = sorted.map(escapeRegex).join('|');
	if (!pattern) return null;
	return new RegExp(pattern, 'gi');
}

async function refreshKeywordCache(): Promise<string[]> {
	const records = await ScamKeywordModel.find({ isActive: true }).select({ keyword: 1, _id: 0 }).lean<Array<{ keyword?: string }>>();
	const keywords = Array.from(
		new Set(records.map((item) => String(item.keyword || '').toLowerCase().trim()).filter(Boolean))
	);
	keywordCache.keywords = keywords;
	keywordCache.matcher = buildKeywordMatcher(keywords);
	keywordCache.loadedAt = Date.now();
	return keywords;
}

async function getActiveKeywords(): Promise<string[]> {
	const now = Date.now();
	const cacheIsFresh = now - keywordCache.loadedAt < KEYWORD_CACHE_TTL_MS;

	if (cacheIsFresh && keywordCache.keywords.length > 0) {
		return keywordCache.keywords;
	}

	if (keywordCache.refreshInFlight) {
		return keywordCache.refreshInFlight;
	}

	keywordCache.refreshInFlight = (async () => {
		try {
			return await refreshKeywordCache();
		} finally {
			keywordCache.refreshInFlight = null;
		}
	})();

	return keywordCache.refreshInFlight;
}

function normalizeUrl(url: string): string {
	return url.replace(/[),.;!?]+$/, '').trim().toLowerCase();
}

async function updateMatchedKeywordStats(matchedKeywords: string[]): Promise<void> {
	if (!matchedKeywords.length) return;
	await ScamKeywordModel.updateMany(
		{ keyword: { $in: matchedKeywords } },
		{ $inc: { matchCount: 1 }, $set: { lastMatchedAt: new Date(), updatedAt: new Date() } }
	);
}

async function upsertScamUrls(urls: string[], sender: string, content: string): Promise<void> {
	if (!urls.length) return;

	for (const rawUrl of urls) {
		const url = normalizeUrl(rawUrl);
		if (!url) continue;
		await ScamUrlModel.updateOne(
			{ url },
			{
				$setOnInsert: { firstSeenAt: new Date() },
				$set: { lastSeenAt: new Date(), lastMessageSample: content, updatedAt: new Date() },
				$inc: { hitCount: 1 },
				$addToSet: { senderSamples: sender }
			},
			{ upsert: true }
		);
	}
}

async function detectScamContent(content: string): Promise<ScamDetectionResult> {
	const detectedUrls = extractUrls(content);
	const activeKeywords = await getActiveKeywords();
	const matchedKeywords = findMatchedKeywords(content, activeKeywords);
	const riskScore = calculateRiskScore(matchedKeywords, detectedUrls);

	let knownScamUrlCount = 0;
	if (detectedUrls.length > 0) {
		knownScamUrlCount = await ScamUrlModel.countDocuments({ url: { $in: detectedUrls.map(normalizeUrl) } });
	}

	// Suspected if URL exists with at least one keyword, or very heavy keyword hit.
	const isSuspected =
		(detectedUrls.length > 0 && matchedKeywords.length > 0) ||
		matchedKeywords.length >= 3 ||
		knownScamUrlCount > 0;

	return {
		isSuspected,
		riskScore,
		matchedKeywords,
		detectedUrls
	};
}

async function detectAndRecordScam(sender: string, content: string): Promise<ScamDetectionResult> {
	const result = await detectScamContent(content);

	if (result.isSuspected) {
		await ScamLogModel.create({
			sender,
			content,
			matchedKeywords: result.matchedKeywords,
			detectedUrls: result.detectedUrls,
			riskScore: result.riskScore
		});

		await upsertScamUrls(result.detectedUrls, sender, content);
		await updateMatchedKeywordStats(result.matchedKeywords);
	}

	return result;
}

export { detectScamContent, detectAndRecordScam, type ScamDetectionResult };
