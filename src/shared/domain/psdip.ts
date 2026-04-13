export const roles = ["civilian", "internal_user"] as const;
export type Role = (typeof roles)[number];

export const reportUrgencies = ["low", "medium", "high"] as const;
export type ReportUrgency = (typeof reportUrgencies)[number];

export const reportStatuses = ["submitted", "duplicate", "rejected", "escalated"] as const;
export type ReportStatus = (typeof reportStatuses)[number];

export const incidentStatuses = [
  "submitted",
  "triaging",
  "confirmed",
  "in_operation",
  "resolved",
] as const;
export type IncidentStatus = (typeof incidentStatuses)[number];

export const sightingSources = ["civilian", "hunter"] as const;
export type SightingSource = (typeof sightingSources)[number];

export const incidentEventTypes = [
  "report_submitted",
  "report_escalated",
  "incident_created",
  "state_changed",
  "sighting_added",
] as const;
export type IncidentEventType = (typeof incidentEventTypes)[number];
