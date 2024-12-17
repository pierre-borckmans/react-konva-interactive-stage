import React, { useState, useEffect } from "react";
import { Dimensions, InteractiveStageRef, Point, VisibleRect } from "../types";

export default function Minimap({
  container,
  initialScale,
  bounds,
  visibleRect,
  minimapPct,
  ready,
}: {
  container: Dimensions;
  initialScale: number;
  scale: number;
  bounds: Dimensions;
  visibleRect: VisibleRect;
  minimapPct: number;
  ready: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });

  const handleDragStart = () => {
    setDragging(true);
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  // Keep position within bounds when container resizes
  useEffect(() => {
    const minimapWidth = container.width * minimapPct;
    const minimapHeight = container.height * minimapPct;

    setPosition((prev) => ({
      x: Math.min(Math.max(prev.x, 0), container.width - minimapWidth),
      y: Math.min(Math.max(prev.y, 0), container.height - minimapHeight),
    }));
  }, [container, minimapPct]);

  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!dragging) return;

      const minimapWidth = container.width * minimapPct;
      const minimapHeight = container.height * minimapPct;

      const newX = Math.min(
        Math.max(position.x + e.movementX, 0),
        container.width - minimapWidth,
      );
      const newY = Math.min(
        Math.max(position.y + e.movementY, 0),
        container.height - minimapHeight,
      );

      setPosition({
        x: newX,
        y: newY,
      });
    };

    if (dragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [dragging, position, container, minimapPct]);

  return (
    <div
      style={{
        opacity: ready ? 1 : 0,
        position: "absolute",
        top: position.y,
        left: position.x,
        cursor: dragging ? "grabbing" : "grab",
        width: container.width * minimapPct,
        height: container.height * minimapPct,
      }}
      onMouseDown={handleDragStart}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: container.width * minimapPct,
          height: container.height * minimapPct,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: "5px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left:
            (visibleRect.left +
              (container.width / initialScale - bounds.width) / 2) *
            initialScale *
            minimapPct,
          top:
            (visibleRect.top +
              (container.height / initialScale - bounds.height) / 2) *
            initialScale *
            minimapPct,
          width:
            (visibleRect.right - visibleRect.left) * minimapPct * initialScale,
          height:
            (visibleRect.bottom - visibleRect.top) * minimapPct * initialScale,
          borderColor: "#ccc7",
          borderStyle: "solid",
          borderWidth: "1px",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}
