## Context

The source assignment asks for a runnable Web product prototype, not a production telemetry platform. The prototype must make reviewer judgment easy: they should be able to understand the target user, core scenarios, product positioning, interaction structure, engineering choices, and AI usage without needing external services.

Target users are fleet operation analysts, vehicle platform support engineers, and battery health analysts. Their shared scenario is time-bounded investigation: find an abnormal vehicle, inspect what happened during a specific window, compare related telemetry, and decide what to check next.

Current repository only contains the assignment document and an OpenSpec workspace, so this change will introduce the application from scratch.

## Goals / Non-Goals

**Goals:**

- Deliver a runnable single-page Web prototype for the AI vehicle data real-time monitoring platform.
- Prioritize decision support over raw log display by combining status, route, metric, event, and insight views.
- Use deterministic local data so reviewers can verify the same scenarios every time.
- Keep the UI clear, restrained, and operational, with dense but readable information.
- Include handoff documentation covering product rationale, run steps, scope boundaries, and AI usage.

**Non-Goals:**

- Build a production backend, real device ingestion pipeline, authentication, or multi-tenant permission model.
- Integrate a paid map SDK, real LLM API, or real BMS vendor protocol.
- Guarantee real-time streaming fidelity; prototype "live" behavior can be simulated.
- Cover every possible vehicle domain signal. The prototype focuses on signals needed to demonstrate judgment.

## Decisions

### Frontend-first React prototype

Use Vite, React, TypeScript, and local data modules.

Rationale: the assignment emphasizes product and interaction judgment, and a frontend-first prototype is the fastest way to make those judgments visible and runnable. TypeScript keeps telemetry models explicit.

Alternatives considered:

- Full backend + database: closer to production, but would spend effort on infrastructure instead of the reviewer-visible workflow.
- Static HTML only: easiest to run, but weaker for stateful filtering, synchronized charts, and component organization.

### Local deterministic telemetry model

Seed vehicle, telemetry, event, and insight data in source code.

Rationale: deterministic data lets the prototype demonstrate online status, GPS trajectory, driving records, battery metrics, and BMS analysis without external dependencies. It also supports crafted anomalies that make AI-assisted triage meaningful.

Alternatives considered:

- Random runtime data: more dynamic but harder to verify and explain.
- External mock API: useful later, unnecessary for a 3-day assessment prototype.

### Time-window centered interaction

Make the selected vehicle and selected time range the main state shared across overview, metric charts, route view, event timeline, and AI insights.

Rationale: the assignment explicitly calls out the difficulty of flexibly viewing one vehicle's detailed data by time period. Synchronizing views around that state makes the prototype more than a collection of panels.

Alternatives considered:

- Metric-first navigation: useful for experts, but less aligned with investigation workflow.
- Log-first table: directly mirrors current platform pain and does not demonstrate enough product judgment.

### Transparent AI-assisted diagnostics

Implement AI-like diagnostics as deterministic rules over telemetry and events, then present risk level, evidence, likely causes, and recommended next checks.

Rationale: this is honest for a prototype. It shows how AI could assist analysis while keeping reviewer behavior reproducible and inspectable. The handoff documentation will state that AI assistance is simulated/rule-based in the prototype.

Alternatives considered:

- Real LLM API: impressive but introduces keys, latency, nondeterminism, and submission friction.
- No AI layer: misses the assignment's AI-native framing and the requirement to explain AI usage.

### Minimal dependency surface

Use a small set of common frontend dependencies and avoid heavyweight UI frameworks.

Rationale: smaller dependency surface reduces setup risk for reviewers. Custom styling can better match an operational dashboard.

Alternatives considered:

- Component library: faster in some areas, but can make the prototype feel generic and overbuilt.
- Charting from scratch: possible, but chart primitives are a solved problem and should not consume the assessment time.

## Risks / Trade-offs

- [Risk] Reviewers expect a backend-like architecture -> Mitigation: document the prototype boundary and describe how local data modules map to future APIs.
- [Risk] Simulated AI is mistaken for a real model integration -> Mitigation: label the prototype logic transparently in documentation and show evidence behind each insight.
- [Risk] Dashboard becomes visually crowded -> Mitigation: use a two-level flow: fleet scanning first, single-vehicle investigation second, with compact cards and consistent filters.
- [Risk] Map implementation lacks geographic fidelity -> Mitigation: use route visualization sufficient for trend and event context, and document that production would use a map SDK.
- [Risk] Time is spent on breadth instead of judgment -> Mitigation: focus on a small number of strong, inspectable scenarios and avoid low-value feature sprawl.
