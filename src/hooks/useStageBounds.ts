import React, { useEffect, useState, useCallback, ReactElement } from "react";
import {
  Bounds,
  InteractiveStageRef,
  InteractiveStageRenderProps,
  Point,
} from "../types";
import { Node } from "konva/lib/Node";
import Konva from "konva";
import useEvents from "./useEvents";

/**
 * A hook that calculates and maintains the bounding box of all shapes in the stage.
 * Updates bounds when shapes are added, removed, or modified.
 * Supports both automatic bounds calculation and manual bounds specification.
 */
export function useStageBounds({
  stageRef,
  loading,
  boundsWidth,
  boundsHeight,
  children,
}: {
  stageRef: InteractiveStageRef;
  loading?: boolean;
  boundsWidth?: number;
  boundsHeight?: number;
  children:
    | React.ReactNode
    | ((props: InteractiveStageRenderProps) => ReactElement);
}) {
  // Initialize bounds with default values
  const [bounds, setBounds] = useState<Bounds>({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });

  // Calculate bounds based on all shapes in the stage
  const updateBounds = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageScale = stage.scaleX();
    const stagePos = stage.position();

    // Find the interactive layer
    const layer = stage.findOne("#interactive-layer") as Konva.Layer;
    if (!layer) {
      // Retry if layer not found (async loading)
      setTimeout(updateBounds, 0);
      return;
    }

    // Get all shapes in the layer
    const nodes = layer.find("Shape");
    if (nodes.length === 0) return;

    // Calculate bounds by finding min/max coordinates of all shapes
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE;
    let maxY = -Number.MAX_VALUE;

    nodes.forEach((node) => {
      const worldBox = getWorldBox(node, stageScale, stagePos);
      minX = Math.min(minX, worldBox.x);
      minY = Math.min(minY, worldBox.y);
      maxX = Math.max(maxX, worldBox.x + worldBox.width);
      maxY = Math.max(maxY, worldBox.y + worldBox.height);
    });

    // Use manual bounds if provided, otherwise use calculated bounds
    const newBounds = {
      x: 0,
      y: 0,
      width: boundsWidth || Math.round(maxX + minX),
      height: boundsHeight || Math.round(maxY + minY),
    };

    // Only update if bounds have significantly changed
    if (
      !bounds ||
      Math.abs(newBounds.x - bounds.x) > 1 ||
      Math.abs(newBounds.y - bounds.y) > 1 ||
      Math.abs(newBounds.width - bounds.width) > 1 ||
      Math.abs(newBounds.height - bounds.height) > 1
    ) {
      setBounds(newBounds);
      if (stageRef.current) {
        stageRef.current.bounds = newBounds;
      }
    }
  }, [bounds, boundsWidth, boundsHeight]);

  useEffect(() => {
    updateBounds();
  }, [loading, updateBounds]);

  // Subscribe to node changes to update bounds
  useEvents({
    stageRef,
    children,
    onNodesAdded: () => {
      updateBounds();
    },
    onNodesRemoved: () => {
      updateBounds();
    },
    onNodesModified: () => {
      updateBounds();
    },
  });

  return { bounds, updateBounds };
}

/**
 * Helper function to calculate the world coordinates of a shape
 * Takes into account the stage's scale and position
 */
function getWorldBox(shape: Node, stageScale: number, stagePos: Point) {
  const box = shape.getClientRect();
  return {
    x: (box.x - stagePos.x) / stageScale,
    y: (box.y - stagePos.y) / stageScale,
    width: box.width / stageScale,
    height: box.height / stageScale,
  };
}
