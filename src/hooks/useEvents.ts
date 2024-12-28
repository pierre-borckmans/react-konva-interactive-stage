import { InteractiveStageRef, InteractiveStageRenderProps } from "../types";
import React, { ReactElement, useEffect, useRef } from "react";
import Konva from "konva";

// List of Konva property change events to monitor
const PROPERTY_EVENTS = [
  "xChange",
  "yChange",
  "scaleXChange",
  "scaleYChange",
  "skewXChange",
  "skewYChange",
  "rotationChange",
  "offsetXChange",
  "offsetYChange",
  "transformsEnabledChange",
  "strokeChange",
  "strokeWidthChange",
  "fillChange",
  "radiusChange",
  "widthChange",
  "heightChange",
] as const;

/**
 * A hook that manages Konva node event subscriptions and shape tracking.
 * Monitors shape additions, removals, and property changes in the stage.
 * Uses requestAnimationFrame for efficient batching of multiple property changes.
 * 
 * @param stageRef - Reference to the Konva stage
 * @param children - Stage children (shapes/layers)
 * @param onNodesAdded - Callback when shapes are added
 * @param onNodesRemoved - Callback when shapes are removed
 * @param onNodesModified - Callback when shapes are modified
 */
export default function useEvents({
  stageRef,
  children,
  onNodesAdded,
  onNodesRemoved,
  onNodesModified,
}: {
  stageRef: InteractiveStageRef;
  children:
    | React.ReactNode
    | ((props: InteractiveStageRenderProps) => ReactElement);
  onNodesAdded?: (nodes: Konva.Node[]) => void;
  onNodesRemoved?: (nodes: Konva.Node[]) => void;
  onNodesModified?: (nodes: Konva.Node[]) => void;
}) {
  // Track all shapes and their modifications using refs to persist between renders
  const shapesRef = useRef<Map<number, Konva.Node>>(new Map());
  const modifiedNodesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Handler for individual property changes on shapes
    const handlePropertyChange = (e: Konva.KonvaEventObject<Node>) => {
      const shape = e.currentTarget;
      if (!shape) return;
      modifiedNodesRef.current.add(shape._id);
      // Use requestAnimationFrame to batch multiple property changes
      requestAnimationFrame(handleShapeChanges);
    };

    // Subscribe shape to all property change events
    const subscribeToPropertyChanges = (shape: Konva.Node) => {
      PROPERTY_EVENTS.forEach((eventName) => {
        shape.on(eventName, handlePropertyChange);
      });
    };

    // Unsubscribe shape from all property change events
    const unsubscribeFromPropertyChanges = (shape: Konva.Node) => {
      PROPERTY_EVENTS.forEach((eventName) => {
        shape.off(eventName, handlePropertyChange);
      });
    };

    const stage = stageRef.current;
    if (!stage) return;

    // Main handler for processing shape changes
    // Detects added, removed, and modified shapes
    const handleShapeChanges = () => {
      // Get current state of shapes
      const currentShapes = stage.find("Shape");
      const currentShapeIds = new Set(currentShapes.map((shape) => shape._id));
      const previousShapeIds = new Set(shapesRef.current.keys());

      // Arrays to track changes
      const addedNodes: Konva.Node[] = [];
      const removedNodes: Konva.Node[] = [];
      const modifiedNodes: Konva.Node[] = [];

      // Check for added shapes by comparing current with previous
      currentShapes.forEach((shape) => {
        if (!previousShapeIds.has(shape._id)) {
          shapesRef.current.set(shape._id, shape);
          addedNodes.push(shape);
          subscribeToPropertyChanges(shape);
        }
      });

      // Check for removed shapes by comparing previous with current
      Array.from(previousShapeIds).forEach((id) => {
        if (!currentShapeIds.has(id)) {
          const trackedNode = shapesRef.current.get(id);
          if (trackedNode) {
            removedNodes.push(trackedNode);
            shapesRef.current.delete(id);
            unsubscribeFromPropertyChanges(trackedNode);
          }
        }
      });

      // Process shapes that have property changes
      const modifiedShapeIds = Array.from(modifiedNodesRef.current);
      modifiedShapeIds.forEach((id) => {
        const shape = currentShapes.find((s) => s._id === id);
        if (shape) {
          modifiedNodes.push(shape);
        }
      });
      modifiedNodesRef.current.clear();

      // Trigger appropriate callbacks for each type of change
      if (addedNodes.length > 0) {
        onNodesAdded?.(addedNodes);
      }
      if (removedNodes.length > 0) {
        onNodesRemoved?.(removedNodes);
      }
      if (modifiedNodes.length > 0) {
        onNodesModified?.(modifiedNodes);
      }
    };

    // Initial shape change detection
    setTimeout(handleShapeChanges, 0);

    // Initial subscription to all existing shapes
    const initialShapes = stage.find("Shape");
    initialShapes.forEach((shape) => {
      shapesRef.current.set(shape._id, shape);
      subscribeToPropertyChanges(shape);
    });

    // Cleanup function to remove all event subscriptions
    return () => {
      Array.from(shapesRef.current.values()).forEach((trackedNode) => {
        unsubscribeFromPropertyChanges(trackedNode);
      });
    };
  }, [stageRef, children, onNodesAdded, onNodesRemoved, onNodesModified]);
}
