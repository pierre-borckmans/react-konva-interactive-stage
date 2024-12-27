import { useEffect, useState } from 'react';

export const useFPS = () => {
  const [fps, setFPS] = useState(0);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFPS = () => {
      const currentTime = performance.now();
      frameCount++;
      
      // Update FPS every second
      if (currentTime - lastTime >= 1000) {
        setFPS(Math.round(frameCount * 1000 / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    const animationFrame = requestAnimationFrame(updateFPS);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);
  
  return fps;
};
