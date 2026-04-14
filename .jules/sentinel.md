## 2026-04-14 - [Sensitive Data Leakage in Error Responses]
**Vulnerability:** Sensitive data like JWT tokens and license keys were being leaked to the client through the 'params' field of ActivepiecesError.
**Learning:** The global error handler in 'packages/server/api/src/app/helper/error-handler.ts' serializes 'error.error.params' directly to the response body.
**Prevention:** Always use 'Record<string, never>' or similar non-sensitive types for error parameters that might contain secrets, and ensure they are sanitized before being passed to an error constructor.
