import { useEffect, useRef, useState } from "react";
import css from "./WorldScene.module.css";

import idleFront from "../../assets/hatsu/idle-front.gif";
import idleBack from "../../assets/hatsu/idle-back.gif";
import idleLeft from "../../assets/hatsu/idle-left.gif";
import idleRight from "../../assets/hatsu/idle-right.gif";

import runFront from "../../assets/hatsu/run-front.gif";
import runBack from "../../assets/hatsu/run-back.gif";
import runLeft from "../../assets/hatsu/run-left.gif";
import runRight from "../../assets/hatsu/run-right.gif";

import {
  CHARACTER_SIZE,
  MAP_HEIGHT,
  MAP_WIDTH,
  SPEED,
} from "./worldConfig";
import type { Direction, Position } from "./worldConfig";
import { clamp, isBlocked } from "./worldUtils";

type WorldHatsuProps = {
  position: Position;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
  onExit: () => void;
};

export default function WorldHatsu({
  position,
  setPosition,
  onExit,
}: WorldHatsuProps) {
  const [direction, setDirection] = useState<Direction>("front");
  const [isMoving, setIsMoving] = useState(false);

  const positionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    const keys = new Set<string>();
    let animationFrame: number;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keys.add(key);

      if (key === "escape") {
        onExit();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.key.toLowerCase());
    };

    const move = () => {
      setPosition((current) => {
        let moveX = 0;
        let moveY = 0;
        let moving = false;

        if (keys.has("w") || keys.has("arrowup")) {
          moveY -= SPEED;
          setDirection("back");
          moving = true;
        }

        if (keys.has("s") || keys.has("arrowdown")) {
          moveY += SPEED;
          setDirection("front");
          moving = true;
        }

        if (keys.has("a") || keys.has("arrowleft")) {
          moveX -= SPEED;
          setDirection("left");
          moving = true;
        }

        if (keys.has("d") || keys.has("arrowright")) {
          moveX += SPEED;
          setDirection("right");
          moving = true;
        }

        setIsMoving(moving);

        const nextPosition = {
          x: clamp(current.x + moveX, 0, MAP_WIDTH - CHARACTER_SIZE),
          y: clamp(current.y + moveY, 0, MAP_HEIGHT - CHARACTER_SIZE),
        };

        if (isBlocked(nextPosition)) {
          return current;
        }

        positionRef.current = nextPosition;
        return nextPosition;
      });

      animationFrame = requestAnimationFrame(move);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    move();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrame);
    };
  }, [onExit, setPosition]);

  const getHatsuImage = () => {
    if (isMoving) {
      if (direction === "front") return runFront;
      if (direction === "back") return runBack;
      if (direction === "left") return runLeft;
      if (direction === "right") return runRight;
    }

    if (direction === "front") return idleFront;
    if (direction === "back") return idleBack;
    if (direction === "left") return idleLeft;
    return idleRight;
  };

  return (
    <div
      className={css.worldHatsu}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <img src={getHatsuImage()} alt="" />
    </div>
  );
}