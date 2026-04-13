# Public Safety Devil Incident Platform (PSDIP)

## Overview

PSDIP is a fictional incident response platform set in the world of Chainsaw Man.

It has two sides:

1. Civilian portal (mobile-first) for reporting devil sightings
2. Internal operations console for managing incidents and tracking devils

The goal is to demonstrate senior-level system design, not UI polish.

---

## MVP Features

### 1. Civilian Report Submission

Civilians can submit a devil sighting report.

Fields:

- description (string)
- location (lat/lng or x/y)
- optional devil type (string)
- urgency (low | medium | high)

Requirements:

- mobile-friendly form
- validated with Valibot
- creates a `report` record

---

### 2. Internal Triage Queue

Internal users can view incoming reports.

Actions:

- mark as duplicate
- reject report
- escalate report → incident

Escalation:

- creates a new `incident`
- links the original report

---

### 3. Incident Lifecycle State Machine

Incident states:

- submitted
- triaging
- confirmed
- in_operation
- resolved

Rules:

- only internal users can transition states
- cannot confirm without at least 1 linked report
- cannot resolve unless already confirmed

State transitions must be enforced in code (not just a DB field).

---

### 4. Devil Tracking System (Core Feature)

The system tracks devil movement over time using events.

#### Sighting Events

Each sighting includes:

- incident_id
- position (x/y or lat/lng)
- source (civilian | hunter)
- confidence (0–1)
- timestamp

#### Behavior

- current devil position is derived from latest sightings
- map shows:
  - current estimated position
  - movement trail (previous sightings)
  - older sightings fade visually

No real-time tracking required. Event-based updates are enough.

---

### 5. Tactical Map (PixiJS)

A 2D map that displays:

- incidents (markers)
- devil positions (derived)
- movement trails

Design:

- black & white base map
- colored markers:
  - red = devils
  - yellow = incidents
  - blue = hunters (optional later)

Interactions:

- click incident → open detail panel
- render trail lines between sightings

---

### 6. Incident Timeline (Audit Log)

Every important action generates an event:

Examples:

- report_submitted
- report_escalated
- incident_created
- state_changed
- sighting_added

Each event includes:

- type
- actor (user or system)
- timestamp
- payload (JSON)

UI:

- chronological timeline on incident page

---

## Data Model (MVP)

### reports

- id
- description
- location
- devil_type (optional)
- urgency
- status (submitted | duplicate | rejected | escalated)
- created_at

### incidents

- id
- title
- status
- created_at

### incident_reports

- id
- incident_id
- report_id

### sightings

- id
- incident_id
- position
- source
- confidence
- created_at

### incident_events

- id
- incident_id
- type
- actor_id (optional)
- payload (JSON)
- created_at

---

## Roles (MVP)

- civilian
- internal_user

Keep permissions simple:

- civilians can create reports
- internal users manage everything else

---

## Non-Goals (for MVP)

Do NOT implement:

- chat system
- live multiplayer presence
- complex authorization matrix
- advanced styling
- notifications
- full manga UI theme

---

## Engineering Goals

This project should demonstrate:

- state machine design
- event-driven architecture (timeline + sightings)
- derived state (devil position from events)
- clean API design with Hono
- type-safe validation with Valibot
- relational modeling with Drizzle
- separation of concerns (public vs internal)

---

## Suggested Build Order

1. Project setup (Workers + Hono)
2. Database schema (Drizzle)
3. Civilian report submission endpoint + UI
4. Internal triage endpoints + UI
5. Incident creation + linking
6. State machine implementation
7. Sighting events + storage
8. Incident timeline system
9. PixiJS map (basic)
10. Map overlays (devil position + trail)

---

## Notes

- Focus on correctness and architecture over UI
- Keep everything simple and extensible
- Prefer explicit logic over "magic"
- Treat this like a real internal system, not a game

---
