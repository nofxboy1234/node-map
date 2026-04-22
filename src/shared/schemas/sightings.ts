import * as v from "valibot";
import { sightingSources } from "../domain/psdip";

const positionSchema = v.object({
  x: v.number(),
  y: v.number(),
});

const confidenceSchema = v.pipe(v.number(), v.minValue(0), v.maxValue(1));

export const createSightingInputSchema = v.object({
  position: positionSchema,
  source: v.picklist(sightingSources),
  confidence: confidenceSchema,
});

const sightingDtoSchema = v.object({
  id: v.string(),
  incidentId: v.string(),
  position: positionSchema,
  source: v.picklist(sightingSources),
  confidence: confidenceSchema,
  createdAt: v.string(),
});

export const createSightingResponseSchema = v.object({
  sighting: sightingDtoSchema,
});

export const getSightingsResponseSchema = v.object({
  sightings: v.array(sightingDtoSchema),
});
