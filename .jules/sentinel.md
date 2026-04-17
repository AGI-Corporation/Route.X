## 2025-05-15 - Sensitive Data Leakage in Error Parameters
**Vulnerability:** Sensitive JWT tokens and license keys were included in `ActivepiecesError` parameters (`INVALID_OR_EXPIRED_JWT_TOKEN` and `INVALID_LICENSE_KEY`).
**Learning:** The global error handler in `packages/server/api/src/app/helper/error-handler.ts` serializes `error.error.params` directly to the API response. This pattern causes information leakage if error parameters contain credentials or secrets.
**Prevention:** Always define `BaseErrorParams` with `Record<string, never>` or non-sensitive fields in `packages/shared/src/lib/common/activepieces-error.ts` for any error that might be triggered by sensitive inputs.
