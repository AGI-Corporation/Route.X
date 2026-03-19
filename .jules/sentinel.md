## 2025-03-19 - Sensitive Data Leakage in Error Parameters
**Vulnerability:** JWT tokens and License Keys were being included in the `params` of `ActivepiecesError`.
**Learning:** The global backend error handler in `packages/server/api/src/app/helper/error-handler.ts` serializes all `error.error.params` directly to the client. If sensitive data like tokens or keys are included in these params, they are leaked in API responses.
**Prevention:** Always use `Record<string, never>` or ensure no sensitive fields are included in error parameter types defined in `packages/shared/src/lib/common/activepieces-error.ts`.
