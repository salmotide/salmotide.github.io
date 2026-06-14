import { useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

import idleFront from "../assets/hatsu/idle-front.gif";
import idleBack from "../assets/hatsu/idle-back.gif";
import idleLeft from "../assets/hatsu/idle-left.gif";
import idleRight from "../assets/hatsu/idle-right.gif";

import runFront from "../assets/hatsu/run-front.gif";
import runBack from "../assets/hatsu/run-back.gif";
import runLeft from "../assets/hatsu/run-left.gif";
import runRight from "../assets/hatsu/run-right.gif";

import clickGif from "../assets/hatsu/click.gif";

type Direction = "front" | "back" | "left" | "right";

type Position = {
  x: number;
  y: number;
};

type MiniHatsuProps = {
  windowRef: RefObject<HTMLElement | null>;
  windowPosition: Position;
  setWindowPosition: Dispatch<SetStateAction<Position>>;
  onEnterWorld: () => void;
};

const CHARACTER_SIZE = 72;
const NORMAL_SPEED = 8;
const PUSH_SPEED = 2;
const PORTAL_DISTANCE = 180;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isOverlapping(
  first: { left: number; right: number; top: number; bottom: number },
  second: { left: number; right: number; top: number; bottom: number },
) {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}

function isNearBottomRightPortal(position: Position) {
  return (
    position.x > window.innerWidth - PORTAL_DISTANCE &&
    position.y > window.innerHeight - PORTAL_DISTANCE
  );
}

export default function MiniHatsu({
  windowRef,
  windowPosition,
  setWindowPosition,
  onEnterWorld,
}: MiniHatsuProps) {
  const [position, setPosition] = useState<Position>({ x: 720, y: 320 });
  const [direction, setDirection] = useState<Direction>("front");
  const [isMoving, setIsMoving] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const windowPositionRef = useRef(windowPosition);
  const positionRef = useRef(position);
  const isPushingRef = useRef(false);

  useEffect(() => {
    windowPositionRef.current = windowPosition;
  }, [windowPosition]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const updatePushing = (value: boolean) => {
    isPushingRef.current = value;
    setIsPushing(value);
  };

  useEffect(() => {
    const keys = new Set<string>();
    let animationFrame: number;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keys.add(key);

      if (key === "e" && isNearBottomRightPortal(positionRef.current)) {
        onEnterWorld();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.key.toLowerCase());
    };

    const pushWindowIfColliding = (
      characterPosition: Position,
      moveX: number,
      moveY: number,
    ) => {
      if (moveX === 0 && moveY === 0) {
        updatePushing(false);
        return;
      }

      const windowElement = windowRef.current;

      if (!windowElement) {
        updatePushing(false);
        return;
      }

      const windowWidth = windowElement.offsetWidth;
      const windowHeight = windowElement.offsetHeight;
      const currentWindowPosition = windowPositionRef.current;

      const characterRect = {
        left: characterPosition.x,
        right: characterPosition.x + CHARACTER_SIZE,
        top: characterPosition.y,
        bottom: characterPosition.y + CHARACTER_SIZE,
      };

      const windowRect = {
        left: currentWindowPosition.x,
        right: currentWindowPosition.x + windowWidth,
        top: currentWindowPosition.y,
        bottom: currentWindowPosition.y + windowHeight,
      };

      const pushing = isOverlapping(characterRect, windowRect);
      updatePushing(pushing);

      if (!pushing) return;

      const nextWindowPosition = {
        x: clamp(
          currentWindowPosition.x + moveX,
          0,
          window.innerWidth - windowWidth,
        ),
        y: clamp(
          currentWindowPosition.y + moveY,
          0,
          window.innerHeight - windowHeight,
        ),
      };

      windowPositionRef.current = nextWindowPosition;
      setWindowPosition(nextWindowPosition);
    };

    const move = () => {
      setPosition((current) => {
        const speed = isPushingRef.current ? PUSH_SPEED : NORMAL_SPEED;

        let moveX = 0;
        let moveY = 0;
        let moving = false;

        if (keys.has("w") || keys.has("arrowup")) {
          moveY -= speed;
          setDirection("back");
          moving = true;
        }

        if (keys.has("s") || keys.has("arrowdown")) {
          moveY += speed;
          setDirection("front");
          moving = true;
        }

        if (keys.has("a") || keys.has("arrowleft")) {
          moveX -= speed;
          setDirection("left");
          moving = true;
        }

        if (keys.has("d") || keys.has("arrowright")) {
          moveX += speed;
          setDirection("right");
          moving = true;
        }

        const nextPosition = {
          x: clamp(current.x + moveX, 0, window.innerWidth - CHARACTER_SIZE),
          y: clamp(current.y + moveY, 0, window.innerHeight - CHARACTER_SIZE),
        };

        positionRef.current = nextPosition;
        setIsMoving(moving);
        pushWindowIfColliding(nextPosition, moveX, moveY);

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
  }, [onEnterWorld, setWindowPosition, windowRef]);

  const getHatsuImage = () => {
    if (isReacting || isPushing) return clickGif;

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

  const isNearPortal = isNearBottomRightPortal(position);

  return (
    <button
      className="hatsu"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={() => {
        setIsReacting(true);
        setTimeout(() => setIsReacting(false), 900);
      }}
      aria-label="Mini Hatsu"
    >
      {isNearPortal && <span className="hatsu-bubble">Press E to enter</span>}
      <img src={getHatsuImage()} alt="" />
    </button>
  );
}