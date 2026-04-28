import { Application, useExtend } from "@pixi/react";
import { Assets, Sprite, Texture } from "pixi.js";
import { useEffect, useState } from "react";

function BunnySprite() {
  useExtend({ Sprite });

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

export function PixiMap() {
  return (
    <div style={{ position: "relative" }}>
      <Application width={800} height={600}>
        <BunnySprite />
      </Application>

      <button
        style={{ position: "absolute", top: 16, left: 16, cursor: "pointer" }}
        onClick={() => console.log("click!")}
      >
        Click
      </button>
    </div>
  );
}
