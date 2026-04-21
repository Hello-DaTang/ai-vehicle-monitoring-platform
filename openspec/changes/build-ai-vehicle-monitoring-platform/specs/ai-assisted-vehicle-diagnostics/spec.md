## ADDED Requirements

### Requirement: Deterministic Risk Detection
The system SHALL derive vehicle risk signals from local telemetry and events using deterministic prototype rules.

#### Scenario: Battery thermal risk is detected
- **WHEN** battery temperature or BMS thermal indicators exceed configured prototype thresholds
- **THEN** the system marks the vehicle or time window with a battery thermal risk insight

#### Scenario: Communication risk is detected
- **WHEN** telemetry has offline state changes or reporting gaps in the selected time window
- **THEN** the system marks the vehicle or time window with a communication risk insight

### Requirement: AI Insight Summary
The system SHALL present AI-assisted summaries that include severity, evidence, likely cause, affected signals, and recommended next checks.

#### Scenario: User opens selected vehicle diagnostics
- **WHEN** diagnostics are available for the selected vehicle and time window
- **THEN** the system displays an insight summary with evidence and recommended follow-up checks

#### Scenario: No significant risk is present
- **WHEN** deterministic rules do not find material anomalies in the selected time window
- **THEN** the system displays a low-risk summary explaining that monitored signals are within prototype thresholds

### Requirement: Explainable Recommendations
The system SHALL make each recommendation traceable to specific telemetry values or events.

#### Scenario: User reads a recommendation
- **WHEN** an insight recommends an action
- **THEN** the system displays the underlying evidence such as temperature, voltage spread, SOC change, GPS gap, or alert event

#### Scenario: Multiple risks exist
- **WHEN** more than one risk is present in the selected time window
- **THEN** the system ranks insights by severity and shows the highest-priority issue first

### Requirement: AI Prototype Boundary
The system SHALL state in the delivery documentation that diagnostic assistance is simulated or rule-based for the prototype unless a real model integration is added.

#### Scenario: Reviewer reads AI usage notes
- **WHEN** the reviewer opens the handoff documentation
- **THEN** the documentation explains how AI was used during development and how the in-product diagnostic logic works
