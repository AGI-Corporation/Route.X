## 2025-05-15 - [XSS mitigation in Health Check]
**Vulnerability:** Use of `dangerouslySetInnerHTML` for rendering health check details.
**Learning:** System metadata (like version numbers) were being formatted as HTML strings and rendered using `dangerouslySetInnerHTML`. While seemingly low risk, this creates an XSS vector if any part of the metadata string can be influenced by an attacker or if the sanitization is missing.
**Prevention:** Always prefer rendering dynamic content as React nodes or JSX fragments over string-based HTML. This allows React's built-in escaping to protect the application from XSS.
