import { RefObject, useEffect, useRef, useState } from "react";
import { Dimensions } from "../types";

/**
 * A hook that observes and returns the dimensions of a DOM element.
 * Uses ResizeObserver to efficiently track size changes.
 * @param ref - Reference to the HTML element to observe
 * @returns Current dimensions (width and height) of the observed element
 */
export function useResizeObserver(ref: RefObject<HTMLElement>) {
  // State to store current dimensions of the observed element
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  // Persist ResizeObserver instance between renders
  const observerRef = useRef<ResizeObserver>();

  useEffect(() => {
    if (!ref.current) return;

    // Get initial dimensions on mount
    const element = ref.current;
    const { width, height } = element.getBoundingClientRect();
    setDimensions({ width, height });

    // Create ResizeObserver to track size changes
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) return;

      const entry = entries[0];
      const { width, height } = entry.contentRect;
      
      // Only update state if dimensions have actually changed (performance optimization)
      setDimensions((prev) => {
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
    });

    observerRef.current = resizeObserver;
    resizeObserver.observe(element);

    // Cleanup: disconnect observer when component unmounts
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref]); // Only re-run if ref changes

  return dimensions;
}
