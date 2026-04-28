import { Application, extend } from "@pixi/react";
import { Assets, Sprite, Texture } from "pixi.js";
import { useEffect, useState } from "react";

extend({
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

export function PixiMap() {
  return (
    <Application>
      <BunnySprite />
    </Application>
  );
}
