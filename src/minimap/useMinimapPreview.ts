import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  ReactElement,
} from "react";
import {
  Bounds,
  Dimensions,
  InteractiveStageRef,
  InteractiveStageRenderProps,
} from "../types";
import throttle from "lodash.throttle";
import useEvents from "../hooks/useEvents";

interface UseMinimapPreviewProps {
  stageRef: InteractiveStageRef;
  bounds: Bounds;
  container: Dimensions;
  initialScale: number;
  enabled: boolean;
  ready: boolean;
  throttleMs?: number;
  children:
    | React.ReactNode
    | ((props: InteractiveStageRenderProps) => ReactElement);
}

export function useMinimapPreview({
  stageRef,
  children,
  bounds,
  container,
  initialScale,
  enabled,
  ready,
  throttleMs = 200,
}: UseMinimapPreviewProps): {
  preview: string | null;
  updatePreview: () => void;
} {
  // Store the preview image URL
  const [preview, setPreview] = useState<string | null>(null);

  // Keep latest props in refs to access in throttled function
  const boundsRef = useRef(bounds);
  const containerRef = useRef(container);
  const initialScaleRef = useRef(initialScale);
  const enabledRef = useRef(enabled);

  // Update refs when props change to ensure throttled function uses latest values
  useEffect(() => {
    boundsRef.current = bounds;
    containerRef.current = container;
    initialScaleRef.current = initialScale;
    enabledRef.current = enabled;
  }, [bounds, container, initialScale, enabled]);

  // Capture the stage content as a data URL
  const capturePreview = useCallback(() => {
    if (!stageRef.current || !enabledRef.current) return;

    const stage = stageRef.current;
    const x = stage.x();
    const y = stage.y();
    const scale = stage.scaleX();

    // Reset transformations temporarily
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });

    // Calculate the padding
    const horizontalPadding =
      (containerRef.current.width / initialScaleRef.current -
        boundsRef.current.width) /
      2;
    const verticalPadding =
      (containerRef.current.height / initialScaleRef.current -
        boundsRef.current.height) /
      2;

    // Calculate the scale based on total visible width ratio
    const totalVisibleWidth = boundsRef.current.width + horizontalPadding * 2;
    const contentScale = stage.width() / totalVisibleWidth;

    // Capture the stage content
    const dataUrl = stage.toDataURL({
      pixelRatio: 0.5, // Lower resolution for better performance
      x: boundsRef.current.x - horizontalPadding,
      y: boundsRef.current.y - verticalPadding,
      width: stage.width() / contentScale,
      height: stage.height() / contentScale,
    });

    // Restore original transformations
    stage.scale({ x: scale, y: scale });
    stage.position({ x, y });

    setPreview(dataUrl);
  }, [stageRef]); // Only depend on stageRef

  // Create a throttled version of capturePreview
  const throttledUpdateRef = useRef(
    throttle(capturePreview, throttleMs, { leading: true, trailing: true }),
  );

  // Update the throttled function when capturePreview changes
  useEffect(() => {
    throttledUpdateRef.current = throttle(capturePreview, throttleMs, {
      leading: true,
      trailing: true,
    });
  }, [capturePreview]);

  // Listen for node changes and update preview
  useEvents({
    stageRef,
    children,
    onNodesAdded: throttledUpdateRef.current,
    onNodesRemoved: throttledUpdateRef.current,
    onNodesModified: throttledUpdateRef.current,
  });

  // Initial preview update when component is ready
  // and when the container dimensions change
  useEffect(() => {
    if (!ready || !enabled) return;
    throttledUpdateRef.current();
  }, [ready, container.width, container.height, enabled]);

  return {
    preview,
    updatePreview: throttledUpdateRef.current,
  };
}
