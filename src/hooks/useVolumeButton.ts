import { useEffect, useRef } from 'react';

interface VolumeButtonOptions {
  onVolumePress: () => void;
  pressCount?: number;
  timeout?: number;
}

export const useVolumeButton = ({ 
  onVolumePress, 
  pressCount = 3, 
  timeout = 2000 
}: VolumeButtonOptions) => {
  const pressTimestamps = useRef<number[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Volume up/down keys
      if (event.key === 'AudioVolumeUp' || event.key === 'AudioVolumeDown') {
        event.preventDefault();
        
        const now = Date.now();
        pressTimestamps.current.push(now);
        
        // Keep only recent presses within timeout
        pressTimestamps.current = pressTimestamps.current.filter(
          timestamp => now - timestamp < timeout
        );
        
        // Check if we have enough presses
        if (pressTimestamps.current.length >= pressCount) {
          onVolumePress();
          pressTimestamps.current = [];
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onVolumePress, pressCount, timeout]);
};

