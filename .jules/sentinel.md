## 2025-05-21 - [Secure postMessage in OAuth Redirect]
**Vulnerability:** Insecure cross-window communication via postMessage using wildcard '*' target origin and weak origin verification on the receiver.
**Learning:** The /redirect endpoint was leaking OAuth codes to any window that opened it because postMessage used '*' as the target origin. The receiver in the frontend used startsWith(event.origin) which could be bypassed by malicious origins (e.g., trusted.com.attacker.com).
**Prevention:** Always resolve the specific trusted origin (using platform context if available) and use strict equality check for origin verification in message event listeners.
