# Route.X — Deep Integrated Roadmap

> **Vision:** Route.X is the foundational operating system for autonomous AI agents — a platform where any developer, business, or AI system can discover, compose, and execute trusted agent workflows at planetary scale.

---

## Guiding Principles

| Principle | Description |
|-----------|-------------|
| **Deep Integration** | Every layer of the stack — from piece metadata to decentralized discovery — is designed to compose seamlessly. |
| **Adaptive Execution** | Workflows self-heal, route intelligently, and gracefully degrade when agents fail. |
| **Open & Trusted** | Agents are verifiably trustworthy via the NANDA protocol, not just powerful. |
| **Human-Centered Automation** | Humans stay in control; automation amplifies rather than replaces human judgment. |
| **Ecosystem-First** | Third-party pieces, agents, and swarms are first-class citizens. |

---

## Phase 1 — Foundation Hardening *(Current · Q2 2026)*

This phase stabilizes the core infrastructure and closes gaps between the existing team roadmaps before accelerating upward.

### 1.1 Flow Execution Engine
- [ ] Multi-region execution queue with automatic failover
- [ ] Sub-second cold-start for flows triggered by AI agents
- [ ] Retry budget & exponential back-off for flaky piece actions
- [ ] Structured execution traces consumable by downstream LLM summarizers

### 1.2 Piece Ecosystem Quality
- [ ] Automated metadata linting for `aiDescription` and `examples` fields on all 280+ pieces
- [ ] Semantic versioning enforcement via CI gate (`npm-publish.yml` gate)
- [ ] Community piece health dashboard (pass rate, latency P99, error breakdown)
- [ ] Universal AI Piece GA: unified LLM gateway abstracting OpenAI, Anthropic, Gemini, and Bedrock

### 1.3 Self-Hosting & Developer Experience
- [ ] One-command Docker Compose stack with hot-reload for piece development
- [ ] `npx ap agent optimize` CLI command GA (suggest `aiDescription` + `examples`)
- [ ] OpenTelemetry-native tracing export (Datadog, Grafana, Honeycomb)
- [ ] Helm chart v2 with auto-scaling worker pools

### 1.4 Embedding SDK
- [ ] React SDK: embeddable flow builder with white-label theming tokens
- [ ] iframe-less embedding via Web Components
- [ ] Event bridge: post-message API for host ↔ embedded flow communication
- [ ] Managed auth delegation (platform API key scoping per tenant)

---

## Phase 2 — Agent OS: Core Integration *(Q3 2026)*

Deliver the three-pillar Agent OS described in `AGENT_FRAMEWORK.md` as production-grade features.

### 2.1 CactusRoute — Adaptive Execution Layer
- [ ] **Adaptive Repair GA**: auto-correct top-20 LLM output errors (date formats, numeric types, boolean coercions)
- [ ] **Semantic Guardrails v1**: hallucination detection via cross-referencing structured piece output schemas
- [ ] **Deterministic Fallback Engine**: regex + schema-driven extraction when LLM tool calls fail
- [ ] Real-time repair telemetry dashboard surfaced in the Admin Console
- [ ] Plugin API for custom repair strategies (open to community contributions)

### 2.2 NANDA Protocol — Decentralized Agent Discovery
- [ ] **`/.well-known/agent.json` endpoint GA** for every Route.X self-hosted instance
- [ ] **AgentFacts JSON-LD schema v1**: standardized capability, trust, and compliance broadcasting
- [ ] Verified Trust Anchors: cryptographic signing of agent manifests (Ed25519)
- [ ] NANDA Index integration: auto-submit manifests to `index.projectnanda.org`
- [ ] `npx ap agent nanda-publish` CLI command GA
- [ ] Compliance flags: `HIPAA`, `GDPR`, `SOC2` automatically surfaced in manifests

### 2.3 Virtual Tool Orchestration — Guido Rule Engine
- [ ] **Tool Blending UI**: drag-and-drop super-tool composer in the flow builder
- [ ] **Guido Rule Engine v1**: declarative pre/post-condition rules for tool calls
- [ ] Conditional validation: enforce required fields before downstream actions execute
- [ ] Super-tool versioning & rollback
- [ ] Super-tool marketplace: publish blended tools for community reuse

---

## Phase 3 — Swarm Intelligence & Specialized Agent Networks *(Q4 2026)*

Build on the Mental Health Swarm proof-of-concept to generalize multi-agent orchestration.

### 3.1 Swarm Orchestration Framework
- [ ] **Swarm Piece SDK**: generalized scaffolding for 10–1000 agent registries (from the 100-agent mental-health-swarm pattern)
- [ ] Dynamic agent selection: route tasks to the best-fit agent based on real-time capability scores
- [ ] Inter-agent messaging bus with delivery guarantees (at-least-once, exactly-once modes)
- [ ] Swarm health monitor: visualize agent utilization, queue depth, and failure rates
- [ ] Circuit breaker: automatically isolate degraded agents without stopping the swarm

### 3.2 Healthcare & Compliance Swarm (SMART on FHIR)
- [ ] **FHIR Piece GA**: stateless proxy to read/write FHIR R4 resources with PHI redaction
- [ ] Mental Health Swarm v2: extend beyond 100 agents with specializations (CBT, DBT, crisis, coaching)
- [ ] CDS Hooks integration: surface workflow automations inside EHR clinical decision flows
- [ ] HIPAA audit log: append-only, tamper-evident log of all PHI-touching agent actions
- [ ] BAA template generator for enterprise healthcare customers

### 3.3 Vertical Swarm Templates
- [ ] **Customer Support Swarm**: triage → escalation → resolution multi-agent pipeline
- [ ] **Sales Intelligence Swarm**: prospecting → enrichment → outreach orchestration
- [ ] **DevOps Swarm**: incident detection → diagnosis → remediation agents
- [ ] **Research Swarm**: web crawl → synthesis → citation verification pipeline
- [ ] Template gallery in the Route.X marketplace

---

## Phase 4 — Deep Platform Integration *(Q1 2027)*

Unify all surfaces — builder, tables, human-in-the-loop, embedding, and AI — into a single coherent agent operating environment.

### 4.1 Tables as Agent Memory
- [ ] Native vector store columns in Tables (pgvector-backed)
- [ ] Agent long-term memory API: `read_memory`, `write_memory`, `search_memory` piece actions
- [ ] Time-windowed context: automatic eviction of stale agent memories
- [ ] Cross-flow memory sharing with row-level permission controls
- [ ] Semantic similarity search UI within the Tables interface

### 4.2 Human-in-the-Loop 2.0
- [ ] **Approval Swarm**: route approvals to the right human based on context, authority, and availability
- [ ] Mobile-native approval surfaces (iOS / Android push with biometric auth)
- [ ] SLA-aware escalation: auto-escalate approvals that breach configured time limits
- [ ] Audit trail: full decision lineage from agent request to human approval to outcome
- [ ] Batch approval mode: reviewers process queued decisions with keyboard shortcuts

### 4.3 AI Copilot Integration (Flow Builder)
- [ ] Natural language flow generation: "Build me a flow that monitors Slack for mentions and creates Jira tickets"
- [ ] AI-assisted step configuration: auto-fill action parameters from prior step outputs
- [ ] Flow diff explainer: plain-English summary of what changed between flow versions
- [ ] Error healing suggestions: Copilot proposes fixes for failed flow runs inline
- [ ] Copilot telemetry: track which suggestions are accepted to improve future recommendations

### 4.4 Management & Platform Admin
- [ ] Multi-tenant agent quota management (rate limits per project, per org)
- [ ] Cost attribution dashboard: $ per flow run, per agent call, per swarm execution
- [ ] Role-based action policies: restrict which pieces/actions specific roles can use
- [ ] SSO federation improvements: SAML 2.0, OIDC, and SCIM provisioning GA
- [ ] Compliance reporting exports (SOC 2, ISO 27001, HIPAA)

---

## Phase 5 — Ecosystem & Open Agentic Web *(Q2 2027)*

Scale Route.X into the connective tissue of the open agentic internet.

### 5.1 Agent Marketplace
- [ ] Public registry for community-published swarms, super-tools, and flow templates
- [ ] Revenue sharing for piece and swarm developers (usage-based royalties)
- [ ] Automated security scanning for marketplace submissions (SAST + secret detection)
- [ ] Verified publisher program with cryptographic identity
- [ ] One-click deploy: install a marketplace swarm into any Route.X instance in < 60 seconds

### 5.2 Cross-Platform Agent Interoperability
- [ ] **MCP (Model Context Protocol) bridge**: expose all Route.X tools to MCP-compatible LLM hosts
- [ ] **OpenAI Function-Calling adapter**: auto-generate OpenAI-compatible tool schemas from piece metadata
- [ ] **LangChain / LlamaIndex integration**: native Route.X tool loader for Python agent frameworks
- [ ] **A2A (Agent-to-Agent) protocol**: standardized inter-agent task delegation with result callbacks
- [ ] Bi-directional NANDA federation: Route.X instances discover and trust each other

### 5.3 Developer Platform
- [ ] Route.X SDK (TypeScript & Python): build agents that orchestrate Route.X flows programmatically
- [ ] GitHub App: trigger flows from PRs, issues, and deployments natively
- [ ] Webhooks v2: guaranteed delivery, retry visibility, and signature verification UI
- [ ] GraphQL API GA: full platform introspection and mutation support
- [ ] Public Postman / Bruno collection kept in sync with OpenAPI spec

### 5.4 Observability & AI Safety
- [ ] **Agent Behavior Auditor**: flag anomalous agent patterns (data exfiltration, prompt injection attempts)
- [ ] Prompt injection detection middleware for all AI piece inputs
- [ ] Red-team mode: sandboxed environment for testing swarms against adversarial prompts
- [ ] Agent carbon footprint dashboard: LLM token usage → CO₂ equivalent estimates
- [ ] Global kill switch: instantly pause all agent executions org-wide with one action

---

## Cross-Cutting Concerns (All Phases)

### Security
- Dependency audit on every PR via Renovate + `npm audit`
- Secret scanning on all commits (GitHub Advanced Security)
- Quarterly third-party penetration testing for cloud edition
- Zero-trust networking between flow engine workers and API server

### Internationalization
- i18n coverage target: 25 languages by end of Phase 3 (Crowdin-managed)
- RTL layout support for Arabic and Hebrew UI surfaces
- Date/number formatting driven by user locale in agent outputs

### Performance Targets
| Metric | Current | Phase 2 Target | Phase 5 Target |
|--------|---------|----------------|----------------|
| Flow trigger latency (P50) | ~800 ms | < 300 ms | < 100 ms |
| Piece action success rate | ~97% | > 99% | > 99.9% |
| Agent manifest generation | N/A | < 500 ms | < 50 ms |
| Swarm agent spin-up | N/A | < 2 s | < 200 ms |

---

## How This Roadmap Connects to Team Roadmaps

| Team | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|------|---------|---------|---------|---------|---------|
| AI Copilot | Universal AI Piece GA | CactusRoute + NANDA | Swarm SDK | Flow Copilot | Cross-platform interop |
| Flow Builder | Sub-second cold-start | Virtual Tool UI | Swarm monitor | AI Copilot UX | — |
| Pieces | Metadata linting | aiDescription GA | Vertical swarm pieces | FHIR Piece GA | Marketplace |
| Tables | — | — | Agent memory columns | Vector store + search | — |
| Human-in-Loop | — | — | Approval Swarm | HITL 2.0 | — |
| Dev Experience | One-command stack | CLI GA | Swarm Piece SDK | — | Route.X SDK |
| Embedding | Web Components | — | Swarm embedding | — | — |
| Platform Admin | — | Compliance flags | HIPAA audit log | Cost attribution | Marketplace trust |

---

## Contributing to the Roadmap

This roadmap is a living document. To propose changes:

1. Open an issue with the label `roadmap` describing the feature and which phase it belongs to.
2. Reference the relevant team roadmap (see `docs/handbook/teams/`) when applicable.
3. For Agent OS–specific proposals, follow the conventions in `AGENT_FRAMEWORK.md`.
4. Large proposals should include a one-page design doc linked from the issue.

---

*Last updated: April 2026 · Maintained by the Route.X core team*
