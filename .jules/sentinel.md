## 2025-05-22 - [Information Disclosure in Error Parameters]
**Vulnerability:** Sensitive data (JWT tokens, license keys) and raw system error messages (SMTP/Git errors) were being leaked in API responses through `ActivepiecesError` parameters.
**Learning:** The global error handler in `packages/server/api/src/app/helper/error-handler.ts` serializes the `params` of `ActivepiecesError` directly to the client. Any sensitive field included in these params is exposed.
**Prevention:** Always use `Record<string, never>` or generic error messages for errors that could contain secrets or internal system details. Audit the `params` types in `activepieces-error.ts` regularly.
