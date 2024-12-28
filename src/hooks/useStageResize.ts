import { useCallback, useEffect, useRef } from "react";
import { Bounds, Dimensions, Point } from "../types";
import { calculateScale } from "./transform-utils";

/**
 * Props for the useStageResize hook.
 */
interface Props {
  bounds: Bounds;
  container: Dimensions;
  scale: number;
  position: Point;
  setScale: (scale: number) => void;
  setPosition: (position: Point, scale?: number) => void;
}

/**
 * A hook that handles stage resizing while maintaining the view center and relative zoom level.
 * Recalculates transform properties when container dimensions change.
 */
export function useStageResize({
  bounds,
  container,
  scale,
  position,
  setScale,
  setPosition,
}: Props) {
  // Keep track of previous container dimensions for relative calculations
  const previousContainer = useRef(container);

  // Update transform properties when container size changes
  const updateTransform = useCallback(() => {
    // Calculate the center point in world coordinates before resize
    const prevCenter = {
      x: (-position.x + previousContainer.current.width / 2) / scale,
      y: (-position.y + previousContainer.current.height / 2) / scale,
    };

    // Calculate scale factors before and after resize
    const prevBaseScale = calculateScale(bounds, previousContainer.current);
    const newBaseScale = calculateScale(bounds, container);
    
    // Maintain relative zoom level
    const relativeScale = scale / prevBaseScale.x;
    const newScale = newBaseScale.x * relativeScale;

    // Calculate new position to maintain the same center point
    const newPosition = {
      x: -prevCenter.x * newScale + container.width / 2,
      y: -prevCenter.y * newScale + container.height / 2,
    };

    // Update transform properties
    setScale(newScale);
    setPosition(newPosition, newScale);

    // Store new container dimensions for next resize
    previousContainer.current = container;
  }, [container, bounds, scale, position, setScale, setPosition]);

  // Trigger transform update when container dimensions change
  useEffect(() => {
    if (
      container.width !== previousContainer.current.width ||
      container.height !== previousContainer.current.height
    ) {
      updateTransform();
    }
  }, [container.width, container.height, updateTransform]);
}
