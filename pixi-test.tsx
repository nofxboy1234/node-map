import { Application, extend } from "@pixi/react";
import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

extend({
  Container,
  Graphics,
  Sprite,
});

function BunnySprite() {
  const [texture, setTexture] = useState(Texture.EMPTY);
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    Assets.load<Texture>("https://pixijs.com/assets/bunny.png").then(
      setTexture,
      (error: unknown) => {
        throw error;
      },
    );
  }, []);

  return (
    <pixiSprite
      anchor={0.5}
      eventMode={"static"}
      onClick={() => setIsActive((current) => !current)}
      onPointerOut={() => setIsHover(false)}
      onPointerOver={() => setIsHover(true)}
      scale={isActive ? 1.5 : isHover ? 1.25 : 1}
      texture={texture}
      x={100}
      y={100}
    />
  );
}

function App() {
  return (
    <Application>
      <BunnySprite />
    </Application>
  );
}

const container = document.querySelector("#root");
if (!container) {
  throw new Error("Missing #root");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
