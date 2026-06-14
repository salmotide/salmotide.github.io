import { useEffect, useState } from "react";
import css from "./WorldScene.module.css";
import worldMap from "../../assets/world/map.png";

import WorldHatsu from "./WorldHatsu";

import {
  CHARACTER_SIZE,
  MAP_HEIGHT,
  MAP_WIDTH,
  ZOOM,
  blockedAreas,
} from "./worldConfig";
import type { Position } from "./worldConfig";
import { clamp } from "./worldUtils";
import { WORLD_SPAWN } from "./worldConfig";

type WorldSceneProps = {
  onExit: () => void;
};

export default function WorldScene({ onExit }: WorldSceneProps) {
  const [position, setPosition] = useState<Position>(WORLD_SPAWN);

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cameraX = clamp(
    position.x * ZOOM - viewport.width / 2 + (CHARACTER_SIZE * ZOOM) / 2,
    0,
    MAP_WIDTH * ZOOM - viewport.width,
  );

  const cameraY = clamp(
    position.y * ZOOM - viewport.height / 2 + (CHARACTER_SIZE * ZOOM) / 2,
    0,
    MAP_HEIGHT * ZOOM - viewport.height,
  );

  return (
    <main className={css.worldViewport}>
      <button className={css.worldExit} onClick={onExit}>
        Back to Desktop
      </button>

      <div className={css.hud}>
        <span>World</span>
        <span>WASD / Arrow Keys • Esc exit</span>
      </div>

      <section
        className={css.camera}
        style={{
          transform: `translate(${-cameraX}px, ${-cameraY}px)`,
        }}
      >
        <div
          className={css.worldMap}
          style={{
            width: `${MAP_WIDTH}px`,
            height: `${MAP_HEIGHT}px`,
            backgroundImage: `url(${worldMap})`,
            transform: `scale(${ZOOM})`,
          }}
        >
          <WorldHatsu
            position={position}
            setPosition={setPosition}
            onExit={onExit}
          />

          {blockedAreas.map((area, index) => (
            <div
              key={index}
              className={css.debugCollider}
              style={{
                left: `${area.x}px`,
                top: `${area.y}px`,
                width: `${area.width}px`,
                height: `${area.height}px`,
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}