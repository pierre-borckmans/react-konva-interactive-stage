import {
  Rect,
  Circle,
  Star,
  RegularPolygon,
  Wedge,
  Ring,
  Group,
} from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import Shape = Konva.Shape;
import { ReactNode, useState } from "react";
import { color } from "../../utils/color.ts";

interface StageContentProps {
  isDark: boolean;
  onShapeClick: (e: KonvaEventObject<MouseEvent>) => void;
  extraShapes: ReactNode[];
}

export const BasicShapes = ({
  isDark,
  onShapeClick,
  extraShapes,
}: StageContentProps) => {
  const [ringExpanded, setRingExpanded] = useState(false);
  const ringRadius = ringExpanded ? 300 : 50;

  return (
    <Group
      onClick={onShapeClick}
      onMouseOver={(e: KonvaEventObject<MouseEvent>) => {
        const shape = e.target as Shape;
        shape.stroke(isDark ? "#fffc" : "#000000");
        shape.strokeWidth(5);
        const container = e.target.getStage()?.container();
        if (container) {
          container.style.cursor = "pointer";
        }
      }}
      onMouseOut={(e) => {
        const shape = e.target as Shape;
        shape.stroke("");
        shape.strokeWidth(0);
        const container = e.target.getStage()?.container();
        if (container) {
          container.style.cursor = "default";
        }
      }}
    >
      <Wedge
        x={1700}
        y={900}
        angle={36}
        radius={ringRadius - 3}
        fill={color(15, isDark)}
        rotation={24}
      />

      <Ring
        x={1700}
        y={900}
        innerRadius={(ringRadius / 3) * 2}
        outerRadius={ringRadius}
        fill={color(9, isDark)}
        onClick={(e) => {
          if (e.evt.button === 0) return;
          e.evt.stopPropagation();
          e.cancelBubble = true;
        }}
        onContextMenu={async (e) => {
          e.evt.preventDefault();
          setRingExpanded(!ringExpanded);
        }}
      />

      {/* Grid of rectangles */}
      {Array.from({ length: 15 }).map((_, i) =>
        Array.from({ length: 15 }).map((_, j) => (
          <Rect
            key={`rect-${i}-${j}`}
            x={50 + i * 30}
            y={50 + j * 30}
            width={20}
            height={20}
            fill={`hsl(${(i + j) * 30}, ${isDark ? "60%" : "70%"}, ${
              isDark ? "45%" : "60%"
            })`}
            cornerRadius={5}
          />
        )),
      )}

      {/* Circles in a spiral */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i * Math.PI) / 5;
        const radius = 1 + i * 15;
        return (
          <Circle
            key={`circle-${i}`}
            x={780 + Math.cos(angle) * radius}
            y={800 + Math.sin(angle) * radius}
            radius={5 + i * 2}
            fill={`hsl(${i * 36}, ${isDark ? "70%" : "80%"}, ${
              isDark ? "40%" : "50%"
            })`}
          />
        );
      })}

      {/* Stars */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Star
          key={`star-${i}`}
          x={800 + i * 120}
          y={230}
          numPoints={3 + i}
          innerRadius={20}
          outerRadius={40 + i * 5}
          fill={`hsl(${i * 72}, ${isDark ? "65%" : "75%"}, ${
            isDark ? "50%" : "65%"
          })`}
        />
      ))}

      {/* Polygons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <RegularPolygon
          key={`polygon-${i}`}
          x={60 + i * 80}
          y={800 + i * 80}
          sides={3 + i}
          radius={30}
          fill={`hsl(${i * 60}, ${isDark ? "60%" : "70%"}, ${
            isDark ? "45%" : "55%"
          })`}
        />
      ))}

      {...extraShapes}
    </Group>
  );
};
