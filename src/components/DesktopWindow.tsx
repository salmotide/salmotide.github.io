import type { ReactNode } from "react";
import useDragWindow from "../hooks/useDragWindow";

type Position = {
  x: number;
  y: number;
};

type DragWindowState = ReturnType<typeof useDragWindow>;

type DesktopWindowProps = {
  title: string;
  initialPosition: Position;
  children: ReactNode;
  canClose?: boolean;
  onClose?: () => void;
  isClosing?: boolean;
  onCloseAnimationEnd?: () => void;
  mobileHidden?: boolean;
  dragState?: DragWindowState;
};

export default function DesktopWindow({
  title,
  initialPosition,
  children,
  canClose = true,
  onClose,
  isClosing = false,
  onCloseAnimationEnd,
  mobileHidden = false,
  dragState,
}: DesktopWindowProps) {
  const internalDragState = useDragWindow(initialPosition);
  const {
    windowRef,
    windowPosition,
    isDragging,
    startDragging,
    dragWindow,
    stopDragging,
  } = dragState ?? internalDragState;

  return (
    <section
      ref={windowRef}
      className={`window ${isDragging ? "is-dragging" : ""} ${
        isClosing ? "is-closing" : ""
      } ${mobileHidden ? "is-mobile-hidden" : ""}`}
      style={{
        left: `${windowPosition.x}px`,
        top: `${windowPosition.y}px`,
      }}
      onAnimationEnd={(event) => {
        if (
          event.animationName === "windowClose" ||
          event.animationName === "mobileCardClose"
        ) {
          onCloseAnimationEnd?.();
        }
      }}
    >
      <div
        className="window-header"
        onPointerDown={startDragging}
        onPointerMove={dragWindow}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <span>{title}</span>

        {canClose && (
          <button
            type="button"
            aria-label={`Close ${title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerMove={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onClose?.();
            }}
          >
            x
          </button>
        )}
      </div>

      <div className="window-body">{children}</div>
    </section>
  );
}
