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
  const [bounds, setBounds] = useState<Bounds>({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });

  const updateBounds = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageScale = stage.scaleX();
    const stagePos = stage.position();

    // Get all nodes in the stage
    // Get the interactive layer
    const layer = stage.findOne("#interactive-layer") as Konva.Layer;
    if (!layer) {
      setTimeout(updateBounds, 0);
      return;
    }
    const nodes = layer.find("Shape");
    if (nodes.length === 0) return;

    // Initialize bounds with the first shape
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE;
    let maxY = -Number.MAX_VALUE;

    // Calculate bounds for all other nodes
    nodes.forEach((node) => {
      const worldBox = getWorldBox(node, stageScale, stagePos);
      minX = Math.min(minX, worldBox.x);
      minY = Math.min(minY, worldBox.y);
      maxX = Math.max(maxX, worldBox.x + worldBox.width);
      maxY = Math.max(maxY, worldBox.y + worldBox.height);
    });

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

  return {
    bounds,
    updateBounds,
  };
}

const getWorldBox = (shape: Node, stageScale: number, stagePos: Point) => {
  const box = shape.getClientRect();
  return {
    x: (box.x - stagePos.x) / stageScale,
    y: (box.y - stagePos.y) / stageScale,
    width: box.width / stageScale,
    height: box.height / stageScale,
  };
};
