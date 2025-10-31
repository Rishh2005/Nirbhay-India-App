import { useEffect, useRef } from 'react';

interface ShakeDetectionOptions {
  threshold?: number;
  timeout?: number;
  onShake: () => void;
}

export const useShakeDetection = ({ 
  threshold = 15, 
  timeout = 1000, 
  onShake 
}: ShakeDetectionOptions) => {
  const lastShake = useRef<number>(0);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const lastZ = useRef<number>(0);

  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const current = Date.now();
      if (current - lastShake.current < timeout) return;

      const { x = 0, y = 0, z = 0 } = event.accelerationIncludingGravity || {};
      
      const deltaX = Math.abs(x - lastX.current);
      const deltaY = Math.abs(y - lastY.current);
      const deltaZ = Math.abs(z - lastZ.current);

      if (deltaX > threshold || deltaY > threshold || deltaZ > threshold) {
        lastShake.current = current;
        onShake();
      }

      lastX.current = x;
      lastY.current = y;
      lastZ.current = z;
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }
  }, [threshold, timeout, onShake]);
};
