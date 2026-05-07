import { Application, useExtend } from "@pixi/react";
import { Container, Graphics, type Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useState } from "react";
import type { InferOutput } from "valibot";
import { getSightingsResponseSchema, type mapIncidentDtoSchema } from "#src/shared";

type MapIncident = InferOutput<typeof mapIncidentDtoSchema>;
type Sighting = InferOutput<typeof getSightingsResponseSchema>["sightings"][number];

type TacticalMapProps = {
  incidents: MapIncident[];
  sightingsByIncidentId: Record<string, Sighting[]>;
};

const mapSize = {
  width: 800,
  height: 520,
};

function toMapPoint(value: number, max: number) {
  return Math.min(Math.max(value, 0), max);
}

function getCurrentSighting(sightings: Sighting[]) {
  return sightings.at(-1) ?? null;
}

function getIncidentSightings(
  sightingsByIncidentId: Record<string, Sighting[]>,
  incidentId: string,
) {
  const sightings = sightingsByIncidentId[incidentId];

  if (!sightings) {
    throw new Error(`Missing sightings for incident ${incidentId}`);
  }

  return sightings;
}

function BaseMap() {
  useExtend({ Graphics });

  const draw = useCallback((graphics: PixiGraphics) => {
    graphics.clear();
    graphics.rect(0, 0, mapSize.width, mapSize.height);
    graphics.fill({ color: 0x111111 });

    graphics.setStrokeStyle({ color: 0x333333, width: 1 });

    for (let x = 0; x <= mapSize.width; x += 80) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, mapSize.height);
    }

    for (let y = 0; y <= mapSize.height; y += 80) {
      graphics.moveTo(0, y);
      graphics.lineTo(mapSize.width, y);
    }

    graphics.stroke();
  }, []);

  return <pixiGraphics draw={draw} />;
}

function MovementTrail({ sightings }: { sightings: Sighting[] }) {
  useExtend({ Graphics });

  const draw = useCallback(
    (graphics: PixiGraphics) => {
      graphics.clear();

      if (sightings.length === 0) {
        return;
      }

      graphics.setStrokeStyle({ color: 0xff3b30, width: 3, alpha: 0.55 });

      sightings.forEach((sighting, index) => {
        const x = toMapPoint(sighting.position.x, mapSize.width);
        const y = toMapPoint(sighting.position.y, mapSize.height);

        if (index === 0) {
          graphics.moveTo(x, y);
          return;
        }

        graphics.lineTo(x, y);
      });

      graphics.stroke();

      sightings.forEach((sighting, index) => {
        const age = sightings.length - index;
        const alpha = Math.max(0.25, 1 - age * 0.18);

        graphics.circle(
          toMapPoint(sighting.position.x, mapSize.width),
          toMapPoint(sighting.position.y, mapSize.height),
          4,
        );
        graphics.fill({ color: 0xff3b30, alpha });
      });
    },
    [sightings],
  );

  return <pixiGraphics draw={draw} />;
}

function DevilMarker({ sighting }: { sighting: Sighting }) {
  useExtend({ Graphics });

  const draw = useCallback((graphics: PixiGraphics) => {
    graphics.clear();
    graphics.circle(0, 0, 9);
    graphics.fill({ color: 0xff3b30 });
    graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
    graphics.stroke();
  }, []);

  return (
    <pixiGraphics
      draw={draw}
      x={toMapPoint(sighting.position.x, mapSize.width)}
      y={toMapPoint(sighting.position.y, mapSize.height)}
    />
  );
}

function IncidentMarker({
  incident,
  isSelected,
  onSelect,
}: {
  incident: MapIncident;
  isSelected: boolean;
  onSelect: () => void;
}) {
  useExtend({ Graphics });

  const draw = useCallback(
    (graphics: PixiGraphics) => {
      graphics.clear();
      graphics.circle(0, 0, isSelected ? 10 : 7);
      graphics.fill({ color: 0xffd447 });
      graphics.setStrokeStyle({ color: 0xffffff, width: isSelected ? 3 : 1 });
      graphics.stroke();
    },
    [isSelected],
  );

  return (
    <pixiGraphics
      cursor="pointer"
      draw={draw}
      eventMode="static"
      onClick={onSelect}
      x={toMapPoint(incident.location.x, mapSize.width)}
      y={toMapPoint(incident.location.y, mapSize.height)}
    />
  );
}

export function PixiMap({ incidents, sightingsByIncidentId }: TacticalMapProps) {
  useExtend({ Container });

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const selectedIncident =
    incidents.find((incident) => incident.id === selectedIncidentId) ?? incidents[0] ?? null;
  const selectedSightings = selectedIncident
    ? getIncidentSightings(sightingsByIncidentId, selectedIncident.id)
    : [];
  const selectedCurrentSighting = getCurrentSighting(selectedSightings);

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={{ position: "relative", width: mapSize.width }}>
        <Application background="#111111" height={mapSize.height} width={mapSize.width}>
          <pixiContainer>
            <BaseMap />
            {incidents.map((incident) => {
              const sightings = getIncidentSightings(sightingsByIncidentId, incident.id);
              const currentSighting = getCurrentSighting(sightings);

              return (
                <pixiContainer key={incident.id}>
                  <MovementTrail sightings={sightings} />
                  {currentSighting ? <DevilMarker sighting={currentSighting} /> : null}
                  <IncidentMarker
                    incident={incident}
                    isSelected={incident.id === selectedIncident?.id}
                    onSelect={() => setSelectedIncidentId(incident.id)}
                  />
                </pixiContainer>
              );
            })}
          </pixiContainer>
        </Application>
      </div>

      {selectedIncident ? (
        <aside>
          <h2>{selectedIncident.title}</h2>
          <dl>
            <dt>Status</dt>
            <dd>{selectedIncident.status}</dd>
            <dt>Incident position</dt>
            <dd>
              {selectedIncident.location.x}, {selectedIncident.location.y}
            </dd>
            <dt>Current devil position</dt>
            <dd>
              {selectedCurrentSighting
                ? `${selectedCurrentSighting.position.x}, ${selectedCurrentSighting.position.y}`
                : "No sightings"}
            </dd>
          </dl>
        </aside>
      ) : (
        <p>No incidents available.</p>
      )}
    </section>
  );
}
