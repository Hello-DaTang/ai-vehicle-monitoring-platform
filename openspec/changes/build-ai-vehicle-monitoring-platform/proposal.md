## Why

The interview assignment asks for a runnable Web product prototype for an AI vehicle data real-time monitoring platform, with visible product, interaction, engineering, and AI-collaboration judgment. A focused monitoring workbench will turn raw vehicle telemetry into time-based observation, comparison, filtering, and decision support rather than a simple log viewer.

## What Changes

- Build a runnable Web prototype for monitoring fleet and single-vehicle telemetry.
- Provide seeded high-frequency vehicle data covering online state, GPS trajectory, driving records, battery metrics, and BMS analysis signals.
- Add workflows for fleet scanning, vehicle selection, time-range filtering, metric comparison, event timeline review, and anomaly triage.
- Add AI-assisted insight surfaces that explain observed risks, likely causes, and suggested next checks using transparent prototype logic.
- Add delivery documentation so reviewers can understand the product positioning, design tradeoffs, how to run the prototype, and how AI was used.

## Capabilities

### New Capabilities

- `vehicle-monitoring-workbench`: Covers the fleet overview, vehicle list, status filtering, map/route context, and operator-oriented dashboard layout.
- `vehicle-time-window-analysis`: Covers single-vehicle time-range exploration, synchronized charts, event timeline, telemetry comparison, and drill-down interactions.
- `ai-assisted-vehicle-diagnostics`: Covers anomaly detection, insight summaries, risk ranking, recommended follow-up checks, and explainability for AI-like assistance.
- `prototype-delivery-documentation`: Covers runnable setup instructions, product/interaction/engineering rationale, scope boundaries, and AI usage disclosure.

### Modified Capabilities

- None.

## Impact

- Adds a new Web application project structure, likely using a frontend-first stack with local mock data to keep the prototype easy to run and review.
- Adds deterministic telemetry data generation or static fixtures for repeatable demonstration.
- Adds UI components for dashboard navigation, filters, charts, timeline, details, and insight panels.
- Adds documentation for reviewer handoff and submission reply.
