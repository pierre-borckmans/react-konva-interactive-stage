import { useEffect, useMemo } from "react";
import throttle from "lodash.throttle";
import { Bounds, Point, VisibleRect } from "../types";

type CallbackProps = {
  throttleMs: number;
  bounds: Bounds;
  position: Point;
  zoom: number;
  visibleRect: VisibleRect;
  onPositionChange?: (position: Point) => void;
  onZoomChange?: (zoom: number) => void;
  onBoundsChange?: (bounds: Bounds) => void;
  onVisibleRectChange?: (rect: VisibleRect) => void;
};

/**
 * A hook that manages throttled callbacks for stage transformations.
 * Prevents excessive callback firing during rapid changes (zoom, pan, etc.).
 */
export default function useCallbacks({
  throttleMs,
  bounds,
  position,
  zoom,
  visibleRect,
  onPositionChange,
  onZoomChange,
  onBoundsChange,
  onVisibleRectChange,
}: CallbackProps) {
  // Create throttled versions of callbacks that only fire after specified delay
  const throttledCallbacks = useMemo(
    () => ({
      // Throttle position updates
      position: onPositionChange && throttle(onPositionChange, throttleMs),
      // Throttle zoom level updates
      zoom: onZoomChange && throttle(onZoomChange, throttleMs),
      // Throttle stage bounds updates
      bounds: onBoundsChange && throttle(onBoundsChange, throttleMs),
      // Throttle visible rectangle updates
      visibleRect:
        onVisibleRectChange && throttle(onVisibleRectChange, throttleMs),
    }),
    [
      onPositionChange,
      onZoomChange,
      onBoundsChange,
      onVisibleRectChange,
      throttleMs,
    ],
  );

  // Trigger position callback when position changes
  useEffect(() => {
    throttledCallbacks.position?.(position);
  }, [position, throttledCallbacks]);

  // Trigger zoom callback when zoom level changes
  useEffect(() => {
    throttledCallbacks.zoom?.(zoom);
  }, [zoom, throttledCallbacks]);

  // Trigger bounds callback when stage bounds change
  useEffect(() => {
    throttledCallbacks.bounds?.(bounds);
  }, [bounds, throttledCallbacks]);

  // Trigger visible rect callback when visible area changes
  useEffect(() => {
    throttledCallbacks.visibleRect?.(visibleRect);
  }, [visibleRect, throttledCallbacks]);

  // Cleanup throttled functions
  useEffect(() => {
    return () => {
      Object.values(throttledCallbacks).forEach((callback) =>
        callback?.cancel(),
      );
    };
  }, [throttledCallbacks]);

  return {};
}
