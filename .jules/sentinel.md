## 2025-05-21 - [Secure postMessage in OAuth Redirect]
**Vulnerability:** Insecure cross-window communication via postMessage using wildcard '*' target origin and weak origin verification on the receiver.
**Learning:** The /redirect endpoint was leaking OAuth codes to any window that opened it because postMessage used '*' as the target origin. The receiver in the frontend used startsWith(event.origin) which could be bypassed by malicious origins (e.g., trusted.com.attacker.com).
**Prevention:** Always resolve the specific trusted origin (using platform context if available) and use strict equality check for origin verification in message event listeners.

## 2025-05-21 - [Prevent Sensitive Data Leakage in Error Responses]
**Vulnerability:** Sensitive JWT tokens and license keys were being returned to the client in error parameters when validation failed.
**Learning:** The global error handler in `packages/server/api/src/app/helper/error-handler.ts` serializes all error parameters to the client. If an error type includes a sensitive field in its `params` definition, it will be exposed.
**Prevention:** Use `Record<string, never>` or exclude sensitive fields from error parameter types in `packages/shared/src/lib/common/activepieces-error.ts`.
