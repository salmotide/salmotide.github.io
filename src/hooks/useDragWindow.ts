import { useRef, useState } from "react";
import type { PointerEvent } from "react";

type Position = {
  x: number;
  y: number;
};

export default function useDragWindow(initialPosition: Position) {
  const [windowPosition, setWindowPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  const windowRef = useRef<HTMLElement | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const startDragging = (event: PointerEvent<HTMLDivElement>) => {
    const windowElement = windowRef.current;
    if (!windowElement) return;

    const rect = windowElement.getBoundingClientRect();

    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragWindow = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const windowElement = windowRef.current;
    const windowWidth = windowElement?.offsetWidth ?? 420;
    const windowHeight = windowElement?.offsetHeight ?? 240;

    const maxX = window.innerWidth - windowWidth;
    const maxY = window.innerHeight - windowHeight;

    const nextX = event.clientX - dragOffset.current.x;
    const nextY = event.clientY - dragOffset.current.y;

    setWindowPosition({
      x: Math.max(0, Math.min(maxX, nextX)),
      y: Math.max(0, Math.min(maxY, nextY)),
    });
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return {
    windowRef,
    windowPosition,
    setWindowPosition,
    isDragging,
    startDragging,
    dragWindow,
    stopDragging,
  };
}