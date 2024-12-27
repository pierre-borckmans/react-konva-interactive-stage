import React, { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import Konva from "konva";
import { useStageTransform } from "./hooks/useStageTransform";
import { InteractiveStageOptions, InteractiveStageProps } from "./types";
import { useResizeObserver } from "./hooks/useResizeObserver";
import useCallbacks from "./hooks/useCallbacks";
import Minimap from "./minimap/Minimap";
import { useMinimapPreview } from "./minimap/useMinimapPreview";

const ABSOLUTE_MAX_ZOOM = 100;
const ABSOLUTE_MIN_ZOOM_SPEED = 0.1;
const ABSOLUTE_MAX_ZOOM_SPEED = 10;
const ABSOLUTE_MIN_PAN_SPEED = 0.1;
const ABSOLUTE_MAX_PAN_SPEED = 10;

const defaultOptions: Required<InteractiveStageOptions> = {
  maxZoom: ABSOLUTE_MAX_ZOOM,
  zoomSpeed: 5,
  zoomAnimationDuration: 0.3,
  panSpeed: 1,
  zoomPanTransitionDelay: 200,
  loadingDelay: 500,
  clampPosition: true,
  callbacksThrottleMs: 25,
  debug: false,
  minimap: {
    show: true,
    size: 0.15,
    containerStyle: {
      backgroundColor: "#0007",
      borderRadius: 5,
    },
    visibleRectStyle: {
      backgroundColor: "#7772",
      borderRadius: 5,
    },
    position: { x: 0, y: 0 },
  },
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
  const [ready, setReady] = useState(false);

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
    position,
    handleDragStart,
    handleDragEnd,
    handleDragMove,
    zoom,
    resetZoom,
    zoomToElement,
    visibleRect,
    wheelContainerRef,
    isDragging,
  } = useStageTransform({
    container,
    boundsWidth,
    boundsHeight,
    options,
    stageRef,
    loading,
    children,
  });

  const { preview: stagePreview } = useMinimapPreview({
    stageRef,
    bounds,
    container,
    initialScale,
    enabled: !!options.minimap.show,
    ready,
    children,
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
          onFinish: () => {
            setReady(true);
          },
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
      {options.debug && <FPSDisplay />}
      <Stage
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
          style={{ cursor: isDragging ? "grabbing" : "default" }}
          {...stageProps}
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

        {options.minimap.show && (
          <Minimap
            ready={ready}
            container={container}
            initialScale={initialScale}
            bounds={bounds}
            visibleRect={visibleRect}
            minimapPct={options.minimap.size || 0.2}
            containerStyle={options.minimap.containerStyle}
            visibleRectStyle={options.minimap.visibleRectStyle}
            initialPosition={options.minimap.position}
            stagePreview={stagePreview}
          />
        )}
      </div>
    </div>
  );
};

export default InteractiveStage;
