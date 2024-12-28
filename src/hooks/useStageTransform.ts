import React, { ReactElement, useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Point,
  InteractiveStageOptions,
  InteractiveStageRef,
  InteractiveStageRenderProps,
} from "../types";
import { useZoomHandlers } from "./useZoomHandlers";
import {
  calculateVisibleRect,
  clampPosition,
  getResetTransform,
} from "./transform-utils";
import { useStageResize } from "./useStageResize";
import { useStageBounds } from "./useStageBounds";
import { useWheelHandlers } from "./useWheelHandlers";
import { useDeepEffect } from "./useDeepEffect";
import { useDragHandlers } from "./useDragHandlers";

interface Props {
  container: Dimensions;
  boundsWidth?: number;
  boundsHeight?: number;
  options: Required<InteractiveStageOptions>;
  stageRef: InteractiveStageRef;
  loading: boolean;
  children:
    | React.ReactNode
    | ((props: InteractiveStageRenderProps) => ReactElement);
}

/**
 * The main hook that orchestrates all stage transformations.
 * Coordinates zoom, pan, drag operations and maintains stage state.
 * Integrates all other transformation-related hooks into a cohesive system.
 */
export function useStageTransform({
  container,
  boundsWidth,
  boundsHeight,
  options,
  stageRef,
  loading,
  children,
}: Props) {
  // Core transform state
  const [scale, setScale] = useState(1);
  const [position, _setPosition] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Get and maintain stage bounds
  const { bounds, updateBounds } = useStageBounds({
    stageRef,
    loading,
    boundsWidth,
    boundsHeight,
    children,
  });

  // Handle position clamping to keep content in view
  const clampAndSetPosition = useCallback(
    (newPosition: Point, newScale: number) => {
      if (!options.clampPosition) {
        _setPosition(newPosition);
        return;
      }

      const clampedPosition = clampPosition(
        newPosition,
        newScale,
        container,
        bounds,
      );
      _setPosition(clampedPosition);
    },
    [bounds, container],
  );

  // Unified position setter that handles scale changes
  const setPosition = useCallback(
    (newPosition: Point, newScale?: number) => {
      if (newScale !== undefined) {
        setScale(newScale);
      }
      clampAndSetPosition(newPosition, newScale ?? scale);
    },
    [scale, clampAndSetPosition],
  );

  // Handle stage resizing while maintaining view
  useStageResize({
    bounds,
    container,
    scale,
    position,
    setScale,
    setPosition,
  });

  // Setup zoom handlers for wheel and programmatic zoom
  const {
    zoom,
    handleZoom,
    handleReset: resetZoom,
    zoomToElement,
  } = useZoomHandlers({
    bounds,
    container,
    scale,
    position,
    setScale,
    setPosition,
    options,
    stageRef,
  });

  // Auto-reset zoom when bounds are first established
  useDeepEffect(() => {
    if (zoom !== 1 || bounds.width === 1) return;
    resetZoom({ animate: true });
  }, [bounds]);

  // Setup drag interaction handlers
  const { handleDragStart, handleDragEnd, handleDragMove } = useDragHandlers({
    isDragging,
    position,
    setIsDragging,
    setPosition,
    scale,
  });

  // Setup wheel event handlers for zoom/pan
  const { wheelContainerRef } = useWheelHandlers({
    stageRef,
    position,
    setPosition,
    handleZoom,
    options,
    loading,
  });

  // Calculate visible area in world coordinates
  const visibleRect = useMemo(
    () => calculateVisibleRect(position, scale, container),
    [position.x, position.y, scale, container.width, container.height],
  );

  // Calculate initial transform for reset operations
  const initialTransform = useMemo(() => {
    return getResetTransform(bounds, container);
  }, [bounds, container]);

  // Return all transform state and handlers
  return {
    wheelContainerRef,

    // Transform state
    initialScale: initialTransform.scale,
    scale,
    initialPosition: initialTransform.position,
    position,

    // Bounds and visibility
    bounds,
    updateBounds,
    visibleRect,

    // Zoom operations
    zoom,
    handleZoom,
    resetZoom,
    zoomToElement,

    // Drag operations
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragMove,
  };
}
