## 2025-05-22 - [Leakage of Sensitive Data in Error Parameters]
**Vulnerability:** API error responses included sensitive data such as JWT tokens, license keys, and internal system error messages in the `params` object of `ActivepiecesError`.
**Learning:** Returning detailed error context to the client can inadvertently expose secrets or internal system details, facilitating further attacks or disclosing intellectual property.
**Prevention:** Redact sensitive fields from error parameters at the shared type level and ensure backend services do not pass them when throwing errors. Use generic localized error messages in the frontend.
