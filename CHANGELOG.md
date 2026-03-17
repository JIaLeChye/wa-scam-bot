# Changelog

All notable changes to the **WA Scam Bot** project will be documented in this file.

## [1.1.0] - 2026-03-17
### Added
- **Scam Detection Module** (`chatBot.ts`): Keyword and URL-based scam detection on incoming messages.
- **ScamLog Collection**: Flagged messages are stored in MongoDB with matched keywords, detected URLs, and a risk score.
- **ScamKeyword Collection**: Keywords are stored and managed in the database instead of hardcoded in code.
- **ScamUrl Collection**: Detected scam URLs are upserted and tracked with hit count, sender samples, and timestamps.
- **In-Memory Keyword Cache**: Keywords are loaded from DB once and cached in memory with a configurable TTL to avoid per-message DB queries.
- **Compiled Regex Matcher**: Keyword list is precompiled into a single regex on cache refresh for faster per-message matching.
- **DB Connection Guard**: App verifies MongoDB connection on startup before launching the bot or serving the dashboard.
- **DB Error Page** (`WebUI/db-error.html`): Serves a 503 error page when the database is unreachable.
- **Dark/Light Mode Toggle**: Dashboard now supports dark and light themes with user preference saved to `localStorage`.
- **Rate Limiting**: Added `express-rate-limit` middleware to protect the dashboard endpoint.

### Changed
- Refactored `index.ts` to use `async` startup flow — bot only starts after DB connects.
- `connectDB()` now throws on failure instead of calling `process.exit()`, enabling error page rendering.
- `db.ts` cleaned up: removed auto-connect side effect on import, added connection pooling options.
- Optimized MongoDB schemas with explicit indexes on frequent query fields.
- Disabled `versionKey` on all schemas to reduce document overhead.
- Environment variable `KEYWORD_CACHE_TTL_MS` now controls keyword cache refresh interval.

### Fixed
- Event name mismatch between backend and frontend for pairing code flow corrected to `request_pairing_code` / `pairing_code`.

## [1.0.0] - 2026-03-07
### Added
- **Web Dashboard**: A local web interface to monitor bot status and logs.
- **Authentication Method**: Added support for Pairing Code (Phone Number) login in addition to QR Code scanning.
- **Database Integration**: Connected to MongoDB to store incoming messages and manage whitelisted numbers.
- **Message Handling**: implemented logic to save messages from non-whitelisted senders to the database.
- **Session Management**: Added logic to handle connection drops and session restoration.
