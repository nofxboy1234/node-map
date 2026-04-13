import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import {
  incidentEventTypes,
  incidentStatuses,
  reportStatuses,
  reportUrgencies,
  sightingSources,
  type IncidentEventType,
  type IncidentStatus,
  type ReportStatus,
  type ReportUrgency,
  type SightingSource,
} from "#src/shared/domain/psdip";

export const notes = sqliteTable("notes", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const reports = sqliteTable(
  "reports",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    description: text("description").notNull(),
    locationX: real("location_x").notNull(),
    locationY: real("location_y").notNull(),
    devilType: text("devil_type"),
    urgency: text("urgency", { enum: reportUrgencies }).$type<ReportUrgency>().notNull(),
    status: text("status", { enum: reportStatuses })
      .$type<ReportStatus>()
      .default("submitted")
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("reports_status_idx").on(table.status),
    index("reports_created_at_idx").on(table.createdAt),
  ],
);

export const incidents = sqliteTable(
  "incidents",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    title: text("title").notNull(),
    status: text("status", { enum: incidentStatuses })
      .$type<IncidentStatus>()
      .default("submitted")
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("incidents_status_idx").on(table.status),
    index("incidents_created_at_idx").on(table.createdAt),
  ],
);

export const incidentReports = sqliteTable(
  "incident_reports",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    incidentId: text("incident_id")
      .notNull()
      .references(() => incidents.id, { onDelete: "cascade" }),
    reportId: text("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("incident_reports_incident_id_idx").on(table.incidentId),
    index("incident_reports_report_id_idx").on(table.reportId),
    uniqueIndex("incident_reports_incident_id_report_id_uidx").on(table.incidentId, table.reportId),
  ],
);

export const sightings = sqliteTable(
  "sightings",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    incidentId: text("incident_id")
      .notNull()
      .references(() => incidents.id, { onDelete: "cascade" }),
    positionX: real("position_x").notNull(),
    positionY: real("position_y").notNull(),
    source: text("source", { enum: sightingSources }).$type<SightingSource>().notNull(),
    confidence: real("confidence").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("sightings_incident_id_created_at_idx").on(table.incidentId, table.createdAt)],
);

export const incidentEvents = sqliteTable(
  "incident_events",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    incidentId: text("incident_id")
      .notNull()
      .references(() => incidents.id, { onDelete: "cascade" }),
    type: text("type", { enum: incidentEventTypes }).$type<IncidentEventType>().notNull(),
    actorId: text("actor_id"),
    payload: text("payload").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("incident_events_incident_id_created_at_idx").on(table.incidentId, table.createdAt),
  ],
);

export * from "./auth-schema";
