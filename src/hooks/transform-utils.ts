import { Bounds, Dimensions, Point, Scale, VisibleRect } from "../types";

/**
 * Calculates the scale factor needed to fit the content within the container.
 * Uses the smallest scale that ensures both width and height fit.
 * @param bounds - Dimensions of the content to scale
 * @param container - Dimensions of the container
 * @returns Scale factors for x and y axes (always equal to maintain aspect ratio)
 */
export function calculateScale(
  bounds: Dimensions,
  container: Dimensions,
): Scale {
  const scaleX = container.width / bounds.width;
  const scaleY = container.height / bounds.height;
  const scale = Math.min(scaleX, scaleY);

  // Prevent division by zero, default to scale of 1
  return { x: scale === 0 ? 1 : scale, y: scale === 0 ? 1 : scale };
}

/**
 * Calculates the position needed to center content within the container.
 * Takes into account content offset and scaling.
 * @param bounds - Bounds of the content including position and dimensions
 * @param container - Container dimensions
 * @param scale - Current scale factor
 * @returns Position coordinates to center the content
 */
export function calculateInitialPosition(
  bounds: Bounds,
  container: Dimensions,
  scale: number,
): Point {
  // Center the content and account for content offset
  const x = (container.width - bounds.width * scale) / 2 - bounds.x * scale;
  const y = (container.height - bounds.height * scale) / 2 - bounds.y * scale;

  return { x, y };
}

/**
 * Gets the transform needed to reset the view to its initial state.
 * Combines scale and position calculations to fit and center content.
 * @param bounds - Content bounds
 * @param container - Container dimensions
 * @returns Initial scale and position for the content
 */
export function getResetTransform(
  bounds: Bounds,
  container: Dimensions,
): { scale: number; position: Point } {
  const initialScale = calculateScale(bounds, container);
  const scale = initialScale.x;
  const position = calculateInitialPosition(bounds, container, scale);

  return { scale, position };
}

/**
 * Calculates the visible portion of the world coordinates.
 * Converts container viewport to world coordinates based on current transform.
 * @param position - Current position in screen coordinates
 * @param scale - Current scale factor
 * @param container - Container dimensions
 * @returns Rectangle defining visible area in world coordinates
 */
export function calculateVisibleRect(
  position: Point,
  scale: number,
  container: Dimensions,
): VisibleRect {
  // Convert screen coordinates to world coordinates
  const worldX = -position.x / scale;
  const worldY = -position.y / scale;
  const visibleWidth = container.width / scale;
  const visibleHeight = container.height / scale;

  return {
    left: worldX,
    top: worldY,
    right: worldX + visibleWidth,
    bottom: worldY + visibleHeight,
  };
}

/**
 * Clamps the position to ensure content stays within view constraints.
 * Prevents content from being scrolled too far outside the visible area.
 * @param position - Proposed new position
 * @param scale - Current scale factor
 * @param container - Container dimensions
 * @param bounds - Content bounds
 * @returns Clamped position that keeps content appropriately visible
 */
export function clampPosition(
  position: Point,
  scale: number,
  container: Dimensions,
  bounds: Bounds,
): Point {
  // Calculate initial transform to determine clamping bounds
  const initialScale = calculateScale(bounds, container);
  const initialPos = calculateInitialPosition(
    bounds,
    container,
    initialScale.x,
  );
  const initialRect = calculateVisibleRect(
    initialPos,
    initialScale.x,
    container,
  );

  // Calculate position limits based on initial view
  const maxPosX = -initialRect.left * scale;
  const minPosX = -initialRect.right * scale + container.width;
  const maxPosY = -initialRect.top * scale;
  const minPosY = -initialRect.bottom * scale + container.height;

  // Clamp position within calculated limits
  const clampedX = Math.max(minPosX, Math.min(maxPosX, position.x));
  const clampedY = Math.max(minPosY, Math.min(maxPosY, position.y));

  return {
    x: clampedX,
    y: clampedY,
  };
}
