## 2025-05-23 - Information Disclosure in Error Responses
**Vulnerability:** API error responses were echoing sensitive data such as JWT tokens, license keys, and detailed error messages from external systems (SMTP, Git).
**Learning:** The global error handler in `packages/server/api/src/app/helper/error-handler.ts` serializes the `params` field of `ActivepiecesError` directly to the client. Any sensitive data included in these params is disclosed.
**Prevention:** Error parameter types in `packages/shared/src/lib/common/activepieces-error.ts` should be strictly defined and should not include sensitive fields. Use `Record<string, never>` if no safe parameters are available.
