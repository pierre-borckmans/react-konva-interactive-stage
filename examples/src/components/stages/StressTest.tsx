import { Circle, Group } from "react-konva";
import { color } from "../../utils/color";
import { useState } from "react";

interface StressTestProps {
  isDark: boolean;
  shapes: Array<{ x: number; y: number; radius: number; color: string }>;
}

export const StressTest = ({ shapes }: StressTestProps) => {
  return (
    <Group>
      {shapes.map((shape, i) => (
        <Circle
          key={i}
          x={shape.x}
          y={shape.y}
          radius={shape.radius}
          fill={shape.color}
        />
      ))}
    </Group>
  );
};

export const useStressTest = (isDark: boolean) => {
  const [shapes, setShapes] = useState<Array<{ x: number; y: number; radius: number; color: string }>>([]);

  const addShapes = (count: number) => {
    const newShapes = Array.from({ length: count }, () => ({
      x: Math.random() * 4000,
      y: Math.random() * 4000,
      radius: 20 + Math.random() * 30,
      color: color(Math.random() * 15, isDark),
    }));
    setShapes((prev) => [...prev, ...newShapes]);
  };

  const clearShapes = () => {
    setShapes([]);
  };

  return {
    shapes,
    setShapes,
    addShapes,
    clearShapes,
    count: shapes.length
  };
};
