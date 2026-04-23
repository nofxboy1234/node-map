import type { AppBindings } from "#src/server/env";
import type {
  countIncidentReports,
  createIncident,
  createIncidentReportLink,
  findIncidentById,
  IncidentRow,
  updateIncidentStatus,
} from "#src/server/repositories/incidents-repository";
import type {
  createReport,
  findReportById,
  listSubmittedReports,
  ReportRow,
  updateReportStatus,
} from "#src/server/repositories/reports-repository";
import type {
  createSighting,
  listIncidentSightings,
  SightingRow,
} from "#src/server/repositories/sightings-repository";
import type { recordIncidentEvent } from "#src/server/services/incident-events-service";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createIncidentMock = vi.fn<typeof createIncident>();
const createIncidentReportLinkMock = vi.fn<typeof createIncidentReportLink>();
const countIncidentReportsMock = vi.fn<typeof countIncidentReports>();
const findIncidentByIdMock = vi.fn<typeof findIncidentById>();
const updateIncidentStatusMock = vi.fn<typeof updateIncidentStatus>();

const createReportMock = vi.fn<typeof createReport>();
const findReportByIdMock = vi.fn<typeof findReportById>();
const listSubmittedReportsMock = vi.fn<typeof listSubmittedReports>();
const updateReportStatusMock = vi.fn<typeof updateReportStatus>();

const createSightingMock = vi.fn<typeof createSighting>();
const listIncidentSightingsMock = vi.fn<typeof listIncidentSightings>();

const recordIncidentEventMock = vi.fn<typeof recordIncidentEvent>();

vi.mock("#src/server/repositories/incidents-repository", () => ({
  createIncident: createIncidentMock,
  createIncidentReportLink: createIncidentReportLinkMock,
  countIncidentReports: countIncidentReportsMock,
  findIncidentById: findIncidentByIdMock,
  updateIncidentStatus: updateIncidentStatusMock,
}));

vi.mock("#src/server/repositories/reports-repository", () => ({
  createReport: createReportMock,
  findReportById: findReportByIdMock,
  listSubmittedReports: listSubmittedReportsMock,
  updateReportStatus: updateReportStatusMock,
}));

vi.mock("#src/server/repositories/sightings-repository", () => ({
  createSighting: createSightingMock,
  listIncidentSightings: listIncidentSightingsMock,
}));

vi.mock("#src/server/services/incident-events-service", () => ({
  recordIncidentEvent: recordIncidentEventMock,
}));

const { transitionIncidentState } = await import("#src/server/services/incidents-service");
const { applyTriageAction } = await import("#src/server/services/reports-service");
const { submitSighting } = await import("#src/server/services/sighting-service");

const env = {} as AppBindings;

function createIncidentRow(overrides: Partial<IncidentRow> = {}): IncidentRow {
  return {
    id: "incident-1",
    title: "Incident Alpha",
    status: "submitted",
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    ...overrides,
  };
}

function createReportRow(overrides: Partial<ReportRow> = {}): ReportRow {
  return {
    id: "report-1",
    description: "Devil near station",
    locationX: 10,
    locationY: 20,
    devilType: null,
    urgency: "medium",
    status: "submitted",
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    ...overrides,
  };
}

function createSightingRow(overrides: Partial<SightingRow> = {}): SightingRow {
  return {
    id: "sighting-1",
    incidentId: "incident-1",
    positionX: 10,
    positionY: 20,
    source: "hunter",
    confidence: 0.8,
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    ...overrides,
  };
}

describe("audit event writes", () => {
  beforeEach(() => {
    createIncidentMock.mockReset();
    createIncidentReportLinkMock.mockReset();
    countIncidentReportsMock.mockReset();
    findIncidentByIdMock.mockReset();
    updateIncidentStatusMock.mockReset();
    createReportMock.mockReset();
    findReportByIdMock.mockReset();
    listSubmittedReportsMock.mockReset();
    updateReportStatusMock.mockReset();
    createSightingMock.mockReset();
    listIncidentSightingsMock.mockReset();
    recordIncidentEventMock.mockReset();
  });

  it("records incident creation and report escalation events", async () => {
    const report = createReportRow();
    const incident = createIncidentRow();

    findReportByIdMock.mockResolvedValue(report);
    createIncidentMock.mockResolvedValue(incident);
    createIncidentReportLinkMock.mockResolvedValue();
    updateReportStatusMock.mockResolvedValue(createReportRow({ status: "escalated" }));

    await applyTriageAction(env, report.id, {
      action: "escalate",
      incidentTitle: incident.title,
      actorId: "user-1",
    });

    expect(recordIncidentEventMock).toHaveBeenCalledWith(env, {
      incidentId: incident.id,
      type: "incident_created",
      actorId: "user-1",
      payload: {
        incidentId: incident.id,
        reportId: report.id,
        title: incident.title,
      },
    });
    expect(recordIncidentEventMock).toHaveBeenCalledWith(env, {
      incidentId: incident.id,
      type: "report_escalated",
      actorId: "user-1",
      payload: {
        reportId: report.id,
      },
    });
  });

  it("records state change events", async () => {
    const incident = createIncidentRow({
      status: "submitted",
    });

    findIncidentByIdMock.mockResolvedValue(incident);
    updateIncidentStatusMock.mockResolvedValue(createIncidentRow({ status: "triaging" }));

    await transitionIncidentState(env, incident.id, {
      nextStatus: "triaging",
      actorId: "user-1",
    });

    expect(recordIncidentEventMock).toHaveBeenCalledWith(env, {
      incidentId: incident.id,
      type: "state_changed",
      actorId: "user-1",
      payload: {
        from: "submitted",
        to: "triaging",
      },
    });
  });

  it("records sighting added events", async () => {
    const incident = createIncidentRow();
    const sighting = createSightingRow();

    findIncidentByIdMock.mockResolvedValue(incident);
    createSightingMock.mockResolvedValue(sighting);

    await submitSighting(env, incident.id, {
      position: {
        x: sighting.positionX,
        y: sighting.positionY,
      },
      source: sighting.source,
      confidence: sighting.confidence,
      actorId: "user-1",
    });

    expect(recordIncidentEventMock).toHaveBeenCalledWith(env, {
      incidentId: incident.id,
      type: "sighting_added",
      actorId: "user-1",
      payload: {
        sightingId: sighting.id,
        position: {
          x: sighting.positionX,
          y: sighting.positionY,
        },
        source: sighting.source,
        confidence: sighting.confidence,
      },
    });
  });
});
