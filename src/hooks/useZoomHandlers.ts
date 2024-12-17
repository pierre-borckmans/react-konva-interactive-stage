import { RefObject, useCallback, useEffect, useRef } from "react";
import Konva from "konva";
import {
  Bounds,
  Dimensions,
  InteractiveStageOptions,
  Point,
  ZoomOptions,
} from "../types";
import { getResetTransform } from "./transform-utils";

interface Props {
  bounds: Bounds;
  container: Dimensions;
  scale: number;
  position: Point;
  setScale: (scale: number) => void;
  setPosition: (position: Point, scale?: number) => void;
  options: Required<InteractiveStageOptions>;
  stageRef: RefObject<Konva.Stage>;
}

export function useZoomHandlers({
  bounds,
  container,
  scale,
  position,
  setScale,
  setPosition,
  stageRef,
  options,
}: Props) {
  const { maxZoom, zoomSpeed } = options;

  // Update reset scale whenever container or bounds changes
  const { scale: resetScale } = getResetTransform(bounds, container);
  const resetScaleRef = useRef(resetScale);

  useEffect(() => {
    resetScaleRef.current = resetScale;
  }, [resetScale]);

  const handleZoom = useCallback(
    (pointer: Point, direction: number, deltaY = 100) => {
      const resetScale = resetScaleRef.current;

      // Convert zoomSpeed from 0-10 range to a base speed (0.1 to 0.5)
      const baseSpeed = 0.1 + (zoomSpeed / 10) * 0.8;

      // Calculate dynamic zoom factor based on wheel speed
      const zoomFactor = 1 + (Math.abs(deltaY) / 100) * baseSpeed;
      const newScale = direction > 0 ? scale / zoomFactor : scale * zoomFactor;

      // Clamp scale relative to reset scale
      const clampedScale = Math.min(
        Math.max(newScale, resetScale),
        resetScale * maxZoom,
      );

      const mousePointTo = {
        x: (pointer.x - position.x) / scale,
        y: (pointer.y - position.y) / scale,
      };

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };

      setScale(clampedScale);
      setPosition(newPos, clampedScale);
    },
    [scale, position, setScale, setPosition, maxZoom, zoomSpeed, resetScaleRef],
  );

  const handleReset = useCallback(
    ({ animate = true }: { animate?: boolean } = {}) => {
      if (!stageRef.current) return;

      const { scale: newScale, position: newPosition } = getResetTransform(
        bounds,
        container,
      );

      animateZoom({
        newScale,
        newX: newPosition.x,
        newY: newPosition.y,
        duration: animate ? options.zoomAnimationDuration : 0,
        startScale: scale,
        startX: position.x,
        startY: position.y,
      });
    },
    [container, stageRef, setScale, setPosition],
  );

  const zoomToElement = useCallback(
    (target: Konva.Node, opt: ZoomOptions = {}) => {
      if (!stageRef.current) return;

      // const { paddingPercent = 0.0, duration = 0.3 } = options;
      const paddingPercent = opt.paddingPercent ?? 0.0;
      const duration =
        opt.duration !== undefined
          ? opt.duration
          : options.zoomAnimationDuration;
      const stage = stageRef.current;
      const resetScale = resetScaleRef.current!;

      // Get bounding box in stage coordinates
      const box = target.getClientRect();
      const stageBox = {
        x: (box.x - stage.x()) / stage.scaleX(),
        y: (box.y - stage.y()) / stage.scaleY(),
        width: box.width / stage.scaleX(),
        height: box.height / stage.scaleY(),
      };

      // Calculate padding based on container constraints
      const scaleX = container.width / stageBox.width;
      const scaleY = container.height / stageBox.height;
      const isWidthConstrained = scaleX <= scaleY;

      const effectivePadding = isWidthConstrained
        ? (stageBox.width * paddingPercent) / 2
        : (stageBox.height * paddingPercent) / 2;

      // Calculate new scale with padding
      const paddedWidth = stageBox.width + effectivePadding * 2;
      const paddedHeight = stageBox.height + effectivePadding * 2;
      const newScaleX = container.width / paddedWidth;
      const newScaleY = container.height / paddedHeight;
      let newScale = Math.min(newScaleX, newScaleY);

      // Clamp scale relative to reset scale
      newScale = Math.min(Math.max(newScale, resetScale), resetScale * maxZoom);

      // Calculate center position
      const newX =
        -stageBox.x * newScale +
        (container.width - stageBox.width * newScale) / 2;
      const newY =
        -stageBox.y * newScale +
        (container.height - stageBox.height * newScale) / 2;

      // Instead of using Konva's animation, update our state
      const startScale = scale;
      const startX = position.x;
      const startY = position.y;

      animateZoom({
        newScale,
        newX,
        newY,
        duration,
        startScale,
        startX,
        startY,
      });
    },
    [
      stageRef,
      container.width,
      container.height,
      maxZoom,
      scale,
      position.x,
      position.y,
      setScale,
      setPosition,
    ],
  );

  const animateZoom = ({
    startTime = Date.now(),
    newScale,
    newX,
    newY,
    duration,
    startScale,
    startX,
    startY,
  }: {
    startTime?: number;
    newScale: number;
    newX: number;
    newY: number;
    duration: number;
    startScale: number;
    startX: number;
    startY: number;
  }) => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / (duration * 1000), 1);

    // Use easeInOut curve
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

    const currentScale = startScale + (newScale - startScale) * eased;
    const currentX = startX + (newX - startX) * eased;
    const currentY = startY + (newY - startY) * eased;

    setScale(currentScale);
    setPosition({ x: currentX, y: currentY }, currentScale);
    if (duration <= 0) return;

    if (progress < 1) {
      requestAnimationFrame(() => {
        animateZoom({
          startTime,
          newScale,
          newX,
          newY,
          duration,
          startScale,
          startX,
          startY,
        });
      });
    }
  };

  const zoom = scale / resetScaleRef.current;

  return {
    zoom,
    handleZoom,
    handleReset,
    zoomToElement,
  };
}
