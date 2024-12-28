import { useCallback, useRef } from "react";
import { Point } from "../types";
import type Konva from "konva";

interface Props {
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  setPosition: (position: Point, scale?: number) => void;
  position: Point;
  scale: number;
}

/**
 * A hook that manages drag interactions for the stage.
 * Handles start, move, and end of drag operations while maintaining position state.
 */
export function useDragHandlers({
  isDragging,
  setIsDragging,
  setPosition,
  position,
  scale,
}: Props) {
  // Store the last mouse position for calculating drag delta
  const lastMousePos = useRef<Point | null>(null);

  // Handle the start of a drag operation
  const handleDragStart = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      // Set dragging state and store initial mouse position
      setIsDragging(true);
      lastMousePos.current = pointerPos;
    },
    [setIsDragging],
  );

  // Handle the end of a drag operation
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    lastMousePos.current = null;
  }, [setIsDragging]);

  // Handle continuous drag movement
  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
      if (!isDragging || !lastMousePos.current) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const dx = pointerPos.x - lastMousePos.current.x;
      const dy = pointerPos.y - lastMousePos.current.y;

      const newPosition = {
        x: position.x + dx,
        y: position.y + dy,
      };

      lastMousePos.current = pointerPos;
      setPosition(newPosition, scale);
    },
    [isDragging, position, setPosition],
  );

  return {
    handleDragStart,
    handleDragEnd,
    handleDragMove,
  };
}
