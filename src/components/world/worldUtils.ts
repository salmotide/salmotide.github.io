import { CHARACTER_SIZE, blockedAreas } from "./worldConfig";
import type { Position, Rect } from "./worldConfig";

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function isCollidingWithRect(position: Position, rect: Rect) {
  const characterRect = {
    left: position.x,
    right: position.x + CHARACTER_SIZE,
    top: position.y,
    bottom: position.y + CHARACTER_SIZE,
  };

  const blockedRect = {
    left: rect.x,
    right: rect.x + rect.width,
    top: rect.y,
    bottom: rect.y + rect.height,
  };

  return (
    characterRect.left < blockedRect.right &&
    characterRect.right > blockedRect.left &&
    characterRect.top < blockedRect.bottom &&
    characterRect.bottom > blockedRect.top
  );
}

export function isBlocked(position: Position) {
  return blockedAreas.some((area) => isCollidingWithRect(position, area));
}