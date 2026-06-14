export type Direction = "front" | "back" | "left" | "right";

export type Position = {
  x: number;
  y: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const MAP_WIDTH = 1536;
export const MAP_HEIGHT = 1024;

export const ZOOM = 1.45;

export const CHARACTER_SIZE = 32;
export const SPEED = 5;

export const blockedAreas: Rect[] = [
  // sea / bottom water
  { x: 650, y: 600, width: 320, height: 390 },
];

export const WORLD_SPAWN = {
  x: 410,
  y: 330,
};