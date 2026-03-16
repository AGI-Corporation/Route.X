## 2025-05-14 - [Insecure postMessage Target Origin in OAuth Redirect]
**Vulnerability:** The OAuth `/redirect` endpoint used `window.postMessage` with a wildcard (`'*'`) target origin, allowing any origin to intercept the authorization code.
**Learning:** In a multi-platform environment like Activepieces, the correct target origin must be resolved dynamically using the platform context to ensure the code is only sent to the trusted frontend.
**Prevention:** Always use `platformUtils.getPlatformIdForRequest(request)` and `domainHelper.getPublicUrl({ platformId })` to resolve the specific origin for `postMessage`.

## 2025-05-14 - [Improper Origin Verification in Frontend OAuth Utility]
**Vulnerability:** The frontend `getCode` function used `startsWith` to verify the origin of `postMessage` events, which could be bypassed (e.g., `https://trusted.com.malicious.com` starts with `https://trusted.com`).
**Learning:** `startsWith` is insufficient for origin verification.
**Prevention:** Always use strict equality (`===`) for origin comparison and extract the origin component correctly using `new URL(url).origin`.
