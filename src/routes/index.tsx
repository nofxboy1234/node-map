import { Application, extend } from "@pixi/react";
import { createFileRoute } from "@tanstack/react-router";
import { Graphics, type Graphics as PixiGraphics } from "pixi.js";
import { useRef } from "react";

// Layout

const NODES = [
  { id: "top", x: 129, y: 10 },
  { id: "leftTop", x: 80, y: 138 },
  { id: "greenStart", x: 283, y: 45 },
  { id: "topRight", x: 410, y: 62 },
  { id: "upperMiddle", x: 305, y: 211 },
  { id: "center", x: 370, y: 271 },
  { id: "rightTop", x: 558, y: 169 },
  { id: "right", x: 655, y: 352 },
  { id: "lowerMiddle", x: 371, y: 415 },
  { id: "lowerInner", x: 334, y: 447 },
  { id: "redStart", x: 102, y: 351 },
  { id: "leftBottom", x: 10, y: 524 },
  { id: "blueStart", x: 122, y: 705 },
] as const;

const EDGES = [
  ["top", "leftTop"],
  ["top", "greenStart"],
  ["top", "upperMiddle"],
  ["top", "lowerMiddle"],
  ["leftTop", "upperMiddle"],
  ["leftTop", "redStart"],
  ["greenStart", "topRight"],
  ["greenStart", "upperMiddle"],
  ["topRight", "center"],
  ["upperMiddle", "center"],
  ["center", "rightTop"],
  ["center", "right"],
  ["center", "redStart"],
  ["rightTop", "right"],
  ["right", "lowerMiddle"],
  ["lowerMiddle", "lowerInner"],
  ["lowerMiddle", "redStart"],
  ["lowerInner", "blueStart"],
  ["redStart", "leftBottom"],
  ["redStart", "blueStart"],
  ["leftBottom", "blueStart"],
] as const satisfies readonly (readonly [NodeId, NodeId])[];

const PLAYERS = [
  { id: "green", color: 0x35c759, nodeId: "greenStart" },
  { id: "red", color: 0xff7a7a, nodeId: "redStart" },
  { id: "blue", color: 0x4f7cff, nodeId: "blueStart" },
] as const;

type Node = (typeof NODES)[number];
type NodeId = Node["id"];

const nodesById = new Map<NodeId, Node>(NODES.map((node) => [node.id, node]));

extend({ Graphics });

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const mountRef = useRef<HTMLDivElement>(null);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#050505",
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: "100%",
          maxWidth: "665px",
          aspectRatio: "665 / 758",
          overflow: "hidden",
          borderRadius: "24px",
        }}
      >
        <Application backgroundColor={0x111111} resizeTo={mountRef}>
          <pixiGraphics draw={drawGraph} />
        </Application>
      </div>
    </main>
  );
}

// Drawing

function drawGraph(graphics: PixiGraphics) {
  graphics.clear();

  drawEdges(graphics);
  drawNodes(graphics);
}

function drawEdges(graphics: PixiGraphics) {
  for (const [startId, endId] of EDGES) {
    const startNode = getNode(startId);
    const endNode = getNode(endId);

    graphics.moveTo(startNode.x, startNode.y).lineTo(endNode.x, endNode.y).stroke({
      color: 0xf5f5f5,
      width: 3,
      alpha: 0.85,
    });
  }
}

function drawNodes(graphics: PixiGraphics) {
  for (const node of NODES) {
    const player = PLAYERS.find((entry) => entry.nodeId === node.id);
    const radius = player ? 12 : 11;
    const color = player ? player.color : 0xf5f5f5;

    graphics.circle(node.x, node.y, radius).fill(color);
  }
}

// Helpers

function getNode(id: NodeId) {
  const node = nodesById.get(id);

  if (!node) {
    throw new Error(`Missing node: ${id}`);
  }

  return node;
}
