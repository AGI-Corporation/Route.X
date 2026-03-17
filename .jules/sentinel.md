## 2026-03-17 - Sensitive Token Leakage in Error Responses
**Vulnerability:** The `INVALID_OR_EXPIRED_JWT_TOKEN` error was including the full JWT token in its `params`, which the global `errorHandler` then echoed back to the client.
**Learning:** Even invalid or expired tokens can reveal sensitive information about the system's token structure or authentication mechanisms. Global error handlers that serialize all error parameters can unintentionally leak sensitive data.
**Prevention:** Sanitize error parameters at the source or in the global error handler. Ensure that error parameter types in `activepieces-error.ts` do not include fields that might contain secrets or tokens.
