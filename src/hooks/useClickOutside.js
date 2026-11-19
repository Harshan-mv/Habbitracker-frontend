import { useEffect } from 'react';

export default function useClickOutside(ref, onOutsideClick, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleOutsidePointer = (event) => {
      const element = ref.current;
      if (element && !element.contains(event.target)) onOutsideClick(event);
    };

    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('touchstart', handleOutsidePointer, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('touchstart', handleOutsidePointer);
    };
  }, [enabled, onOutsideClick, ref]);
}
