import { Application, useExtend } from "@pixi/react";
import { Container, Graphics, type Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useState } from "react";
import type { InferOutput } from "valibot";
import type { mapIncidentDtoSchema } from "#src/shared";

type MapIncident = InferOutput<typeof mapIncidentDtoSchema>;

type TacticalMapProps = {
  incidents: MapIncident[];
};

const mapSize = {
  width: 800,
  height: 520,
};

function toMapPoint(value: number, max: number) {
  return Math.min(Math.max(value, 0), max);
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
      graphics.fill({ color: 0xffd47 });
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

export function PixiMap({ incidents }: TacticalMapProps) {
  useExtend({ Container });

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const selectedIncident =
    incidents.find((incident) => incident.id === selectedIncidentId) ?? incidents[0] ?? null;

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={{ position: "relative", width: mapSize.width }}>
        <Application background="#111111" height={mapSize.height} width={mapSize.height}>
          <pixiContainer>
            <BaseMap />
            {incidents.map((incident) => (
              <IncidentMarker
                key={incident.id}
                incident={incident}
                isSelected={incident.id === selectedIncident?.id}
                onSelect={() => setSelectedIncidentId(incident.id)}
              />
            ))}
          </pixiContainer>
        </Application>
      </div>

      {selectedIncident ? (
        <aside>
          <h2>{selectedIncident.id}</h2>
          <dl>
            <dt>Status</dt>
            <dd>{selectedIncident.status}</dd>
            <dt>Position</dt>
            <dd>
              {selectedIncident.location.x}, {selectedIncident.location.y}
            </dd>
          </dl>
        </aside>
      ) : (
        <p>No incidents availble.</p>
      )}
    </section>
  );
}
