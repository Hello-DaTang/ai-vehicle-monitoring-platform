## ADDED Requirements

### Requirement: Runnable Setup Instructions
The project SHALL include clear instructions that allow a reviewer to install dependencies, start the prototype, and verify the main workflow.

#### Scenario: Reviewer starts the prototype
- **WHEN** the reviewer follows the documented setup commands
- **THEN** the Web prototype runs locally and exposes the monitoring dashboard

#### Scenario: Reviewer wants a quick validation path
- **WHEN** the reviewer reads the documentation
- **THEN** the documentation describes the recommended vehicle, time window, and scenario to inspect

### Requirement: Product And Interaction Rationale
The project SHALL document the target users, core scenarios, product positioning, prioritized problems, and major interaction choices.

#### Scenario: Reviewer evaluates product judgment
- **WHEN** the reviewer reads the product rationale
- **THEN** they can understand why the prototype prioritizes time-window investigation and decision support over raw log browsing

### Requirement: Engineering Boundary Explanation
The project SHALL document major technical choices, prototype boundaries, and how the implementation could evolve toward production.

#### Scenario: Reviewer evaluates engineering judgment
- **WHEN** the reviewer reads the engineering notes
- **THEN** they can understand why the prototype uses local data and what would change for real ingestion, persistence, permissions, and AI services

### Requirement: AI Collaboration Disclosure
The project SHALL include a concise description of where AI tools were used, which tools were used, how suggestions were evaluated, and what role AI played in decisions.

#### Scenario: Reviewer evaluates AI usage
- **WHEN** the reviewer reads the AI usage section
- **THEN** they can distinguish human decisions from AI-assisted drafting, coding, testing, and critique
