import { useCallback, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

export function useMagnetic(strength = 0.38) {
  const elementRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const magneticX = useSpring(x, { stiffness: 160, damping: 16, mass: 0.5 });
  const magneticY = useSpring(y, { stiffness: 160, damping: 16, mass: 0.5 });

  const setRef = useCallback((node) => {
    elementRef.current = node;
  }, []);

  const onMove = useCallback((event) => {
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;

    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }, [strength, x, y]);

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { setRef, x: magneticX, y: magneticY, onMove, onLeave };
}
