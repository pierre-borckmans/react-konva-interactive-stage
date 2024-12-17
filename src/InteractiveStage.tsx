import React, { useCallback, useEffect, useRef } from "react";
import { Stage, Layer, Rect } from "react-konva";
import Konva from "konva";
import { useStageTransform } from "./hooks/useStageTransform";
import { InteractiveStageOptions, InteractiveStageProps } from "./types";
import { useResizeObserver } from "./hooks/useResizeObserver";
import useCallbacks from "./hooks/useCallbacks";
import Minimap from "./minimap/Minimap";

const ABSOLUTE_MAX_ZOOM = 100;
const ABSOLUTE_MIN_ZOOM_SPEED = 0.1;
const ABSOLUTE_MAX_ZOOM_SPEED = 10;
const ABSOLUTE_MIN_PAN_SPEED = 0.1;
const ABSOLUTE_MAX_PAN_SPEED = 10;

const defaultOptions: Required<InteractiveStageOptions> = {
  maxZoom: ABSOLUTE_MAX_ZOOM,
  zoomSpeed: 5,
  panSpeed: 1,
  zoomPanTransitionDelay: 200,
  loadingDelay: 500,
  clampPosition: true,
  callbacksThrottleMs: 25,
  debug: false,
};

const InteractiveStage: React.FC<InteractiveStageProps> = ({
  stageRef,
  className,
  style,
  children,

  // optional dimensions in canvas units.
  // If not provided, the stage will automatically resize to fit its children.
  width: boundsWidth,
  height: boundsHeight,

  // options
  options: propsOptions,

  // callbacks
  onPositionChange,
  onZoomChange,
  onBoundsChange,
  onVisibleRectChange,

  // rest of Konva Stage props
  ...stageProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(containerRef);

  // Merge default options with props options
  const options: Required<InteractiveStageOptions> = {
    ...defaultOptions,
    ...propsOptions,
  };
  // Enforce zoom constraints
  options.maxZoom = Math.min(options.maxZoom, ABSOLUTE_MAX_ZOOM);
  // Enforce pan speed constraints
  options.panSpeed = Math.max(options.panSpeed, ABSOLUTE_MIN_PAN_SPEED);
  options.panSpeed = Math.min(options.panSpeed, ABSOLUTE_MAX_PAN_SPEED);
  // Enforce zoom speed constraints
  options.zoomSpeed = Math.max(options.zoomSpeed, ABSOLUTE_MIN_ZOOM_SPEED);
  options.zoomSpeed = Math.min(options.zoomSpeed, ABSOLUTE_MAX_ZOOM_SPEED);

  const loading = stageRef.current === null;

  const { width, height } = dimensions;

  const container = {
    width,
    height,
  };

  const {
    bounds,
    updateBounds,
    initialScale,
    scale,
    initialPosition,
    position,
    handleDragStart,
    handleDragEnd,
    handleDragMove,
    zoom,
    resetZoom,
    zoomToElement,
    visibleRect,
    wheelContainerRef,
  } = useStageTransform({
    container,
    boundsWidth,
    boundsHeight,
    options,
    stageRef,
    loading,
  });

  // reset zoom on double click
  const handleDoubleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
      resetZoom();
    },
    [resetZoom],
  );

  // fade in the stage once it's loaded
  useEffect(() => {
    if (loading) return;
    setTimeout(() => {
      if (stageRef.current) {
        stageRef.current.to({
          opacity: 1,
          duration: 0.2,
          easing: Konva.Easings.EaseInOut,
        });
      }
    }, options.loadingDelay);
  }, [loading, options.loadingDelay]);

  // update callbacks
  useCallbacks({
    throttleMs: options.callbacksThrottleMs,
    bounds,
    position,
    zoom,
    visibleRect,
    onPositionChange,
    onZoomChange,
    onBoundsChange,
    onVisibleRectChange,
  });

  const renderProps = {
    container,
    zoomToElement,
    resetZoom,
    loading,
    scale,
    position,
    bounds,
    updateBounds: () => {
      setTimeout(() => updateBounds(), 50);
    },
    visibleRect,
    options,
  };

  const minimapPct = 0.15;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
        ref={wheelContainerRef}
      >
        <Stage
          {...stageProps}
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={!loading ? handleDragStart : undefined}
          onMouseUp={!loading ? handleDragEnd : undefined}
          onMouseMove={!loading ? handleDragMove : undefined}
          onDblClick={!loading ? handleDoubleClick : undefined}
          x={position.x}
          y={position.y}
          scaleX={scale}
          scaleY={scale}
          opacity={0}
        >
          {options.debug && (
            <Layer id="debug-layer">
              <Rect
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                stroke={"#777"}
                strokeWidth={0.3}
                dash={[5, 10]}
                strokeScaleEnabled={false}
              />
            </Layer>
          )}

          <Layer id="interactive-layer">
            {typeof children === "function" ? children(renderProps) : children}
          </Layer>
        </Stage>
        <Minimap
          scale={scale}
          initialScale={initialScale}
          bounds={bounds}
          visibleRect={visibleRect}
          minimapPct={minimapPct}
          container={container}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default InteractiveStage;
