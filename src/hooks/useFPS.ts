import { useEffect, useState } from 'react';

/**
 * A hook that measures and returns the current frames per second (FPS).
 * Uses requestAnimationFrame to track frame updates and calculate FPS.
 * @returns The current FPS value
 */
export const useFPS = () => {
  // State to store the current FPS value
  const [fps, setFPS] = useState(0);
  
  useEffect(() => {
    // Track frame count and time for FPS calculation
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFPS = () => {
      const currentTime = performance.now();
      frameCount++;
      
      // Update FPS every second (1000ms)
      if (currentTime - lastTime >= 1000) {
        // Calculate FPS: frames * (1000ms / elapsed time)
        setFPS(Math.round(frameCount * 1000 / (currentTime - lastTime)));
        // Reset counters for next calculation
        frameCount = 0;
        lastTime = currentTime;
      }
      
      // Schedule next frame update
      requestAnimationFrame(updateFPS);
    };
    
    // Start the FPS measurement loop
    const animationFrame = requestAnimationFrame(updateFPS);
    
    // Cleanup: cancel animation frame on unmount
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []); // Empty deps array as this effect should only run once
  
  return fps;
};
