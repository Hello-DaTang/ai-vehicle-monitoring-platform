## ADDED Requirements

### Requirement: Fleet Operational Overview
The system SHALL present a fleet-level monitoring workbench that summarizes vehicle count, online/offline status, active alerts, average battery level, and currently selected investigation window.

#### Scenario: Operator scans fleet health
- **WHEN** the user opens the application
- **THEN** the system displays fleet summary indicators, vehicle rows, and status distribution for the seeded vehicle data

#### Scenario: Operator identifies abnormal vehicles
- **WHEN** seeded telemetry contains alerting or offline vehicles
- **THEN** the system visually distinguishes abnormal vehicles from normal vehicles

### Requirement: Vehicle Search And Filtering
The system SHALL allow users to narrow the vehicle list by search text, status, risk level, and vehicle group.

#### Scenario: User filters by online status
- **WHEN** the user selects an online-state filter
- **THEN** the vehicle list and summary counts update to reflect matching vehicles

#### Scenario: User searches by vehicle identifier
- **WHEN** the user enters a vehicle identifier or license keyword
- **THEN** the system displays only vehicles whose visible identity fields match the query

### Requirement: Vehicle Selection Workflow
The system SHALL keep the selected vehicle visible across dashboard panels and use it as the context for route, telemetry, events, and diagnostics.

#### Scenario: User selects a vehicle row
- **WHEN** the user selects a vehicle from the fleet list
- **THEN** the route view, detail header, metric panels, timeline, and AI insight panel update to the selected vehicle

#### Scenario: Selected vehicle leaves filtered result set
- **WHEN** filters remove the currently selected vehicle from the visible list
- **THEN** the system selects the first available matching vehicle or shows an empty state if no vehicles match

### Requirement: Route And Location Context
The system SHALL provide a visual route or position context for the selected vehicle using local telemetry coordinates and event markers.

#### Scenario: User reviews selected vehicle route
- **WHEN** the selected vehicle has GPS telemetry within the selected time window
- **THEN** the system displays the route shape, current point, and relevant event markers

#### Scenario: Time window has no route data
- **WHEN** no GPS telemetry exists for the selected vehicle in the selected time window
- **THEN** the system displays a clear empty state instead of a misleading route
