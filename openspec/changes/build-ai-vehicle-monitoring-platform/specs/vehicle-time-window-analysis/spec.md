## ADDED Requirements

### Requirement: Shared Time Window
The system SHALL provide a time-window selector that controls all selected-vehicle analysis panels consistently.

#### Scenario: User changes time range
- **WHEN** the user changes the active time window
- **THEN** metric charts, route points, event timeline, and diagnostics recalculate from telemetry inside that window

#### Scenario: Time window excludes all telemetry
- **WHEN** the active time window has no telemetry for the selected vehicle
- **THEN** the system shows empty states and preserves the user's selected filters

### Requirement: Synchronized Telemetry Metrics
The system SHALL visualize key telemetry metrics for the selected vehicle, including speed, battery state of charge, battery temperature, voltage, current, and BMS health indicators.

#### Scenario: User reviews battery and driving metrics
- **WHEN** telemetry exists in the active time window
- **THEN** the system displays synchronized charts and current summary values for driving and battery metrics

#### Scenario: User compares metric trends
- **WHEN** multiple metrics are displayed for the same time window
- **THEN** the system aligns them by timestamp so anomalies can be compared across signals

### Requirement: Event Timeline
The system SHALL organize driving records, online-state changes, battery warnings, and BMS analysis events into a chronological timeline.

#### Scenario: User investigates an alert
- **WHEN** the selected time window contains events
- **THEN** the system displays events in chronological order with severity, timestamp, event type, and short description

#### Scenario: User filters by severity
- **WHEN** the user selects an event severity filter
- **THEN** the timeline displays only matching events while retaining the active vehicle and time window

### Requirement: Time-Scoped Comparison
The system SHALL show before/after or segment-level comparison values for the selected time window so users can judge whether the vehicle is improving, stable, or degrading.

#### Scenario: User reviews change summary
- **WHEN** telemetry exists at the beginning and end of the selected time window
- **THEN** the system displays deltas for battery level, temperature, mileage, and risk score

#### Scenario: Comparison lacks sufficient data
- **WHEN** fewer than two telemetry points exist in the selected time window
- **THEN** the system indicates that comparison is unavailable for the current selection
