import * as v from "valibot";
import { reportStatuses, reportUrgencies } from "#src/shared/domain/psdip";

const locationSchema = v.object({
  x: v.number(),
  y: v.number(),
});

const devilTypeSchema = v.pipe(v.string(), v.minLength(1));
const incidentTitleSchema = v.pipe(v.string(), v.minLength(1));

export const createReportInputSchema = v.object({
  description: v.pipe(v.string(), v.minLength(1)),
  location: locationSchema,
  devilType: v.optional(devilTypeSchema),
  urgency: v.picklist(reportUrgencies),
});

export const triageReportActionInputSchema = v.variant("action", [
  v.object({
    action: v.literal("mark_duplicate"),
  }),
  v.object({
    action: v.literal("reject"),
  }),
  v.object({
    action: v.literal("escalate"),
    incidentTitle: incidentTitleSchema,
  }),
]);

export const reportDtoSchema = v.object({
  id: v.string(),
  description: v.string(),
  location: locationSchema,
  devilType: v.nullable(v.string()),
  urgency: v.picklist(reportUrgencies),
  status: v.picklist(reportStatuses),
  createdAt: v.string(),
});

export const createReportResponseSchema = v.object({
  report: reportDtoSchema,
});

export const triageQueueResponseSchema = v.object({
  reports: v.array(reportDtoSchema),
});

export const triageReportResponseSchema = v.object({
  report: reportDtoSchema,
  incidentId: v.nullable(v.string()),
});
