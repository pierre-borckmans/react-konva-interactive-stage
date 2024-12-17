import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Point,
  InteractiveStageOptions,
  InteractiveStageRef,
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
}

export function useStageTransform({
  container,
  boundsWidth,
  boundsHeight,
  options,
  stageRef,
  loading,
}: Props) {
  const [scale, setScale] = useState(1);
  const [position, _setPosition] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const { bounds, updateBounds } = useStageBounds({
    stageRef,
    loading,
    boundsWidth,
    boundsHeight,
  });

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

  const setPosition = useCallback(
    (newPosition: Point, newScale?: number) => {
      if (newScale !== undefined) {
        setScale(newScale);
      }
      clampAndSetPosition(newPosition, newScale ?? scale);
    },
    [scale, clampAndSetPosition],
  );

  useStageResize({
    bounds,
    container,
    scale,
    position,
    setScale,
    setPosition,
  });

  // setup zoom handlers
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

  // Reset zoom when bounds change from null to real bounds
  useDeepEffect(() => {
    if (zoom !== 1 || bounds.width === 1) return;
    resetZoom({ animate: true });
  }, [bounds]);

  // setup drag handlers
  const { handleDragStart, handleDragEnd, handleDragMove } = useDragHandlers({
    isDragging,
    position,
    setIsDragging,
    setPosition,
    scale,
  });

  // setup mouse wheel handlers
  const { wheelContainerRef } = useWheelHandlers({
    stageRef,
    position,
    setPosition,
    handleZoom,
    options,
    loading,
  });

  // Calculate the visible rect in world coordinates
  const visibleRect = useMemo(
    () => calculateVisibleRect(position, scale, container),
    [position.x, position.y, scale, container.width, container.height],
  );

  const initialTransform = useMemo(() => {
    return getResetTransform(bounds, container);
  }, [bounds, container]);

  return {
    wheelContainerRef,

    initialScale: initialTransform.scale,
    scale,
    initialPosition: initialTransform.position,
    position,

    // stage bounds and visible rect
    bounds,
    updateBounds,
    visibleRect,

    // zoom handlers
    zoom,
    handleZoom,
    resetZoom,
    zoomToElement,

    // drag handlers
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragMove,
  };
}
