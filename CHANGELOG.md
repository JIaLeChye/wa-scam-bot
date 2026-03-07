# Changelog

All notable changes to the **WA Scam Bot** project will be documented in this file.

## [1.0.0] - 2026-03-07
### Added
- **Web Dashboard**: A local web interface to monitor bot status and logs.
- **Authentication Method**: Added support for Pairing Code (Phone Number) login in addition to QR Code scanning.
- **Database Integration**: Connected to MongoDB to store incoming messages and manage whitelisted numbers.
- **Message Handling**: implemented logic to save messages from non-whitelisted senders to the database.
- **Session Management**: Added logic to handle connection drops and session restoration.
