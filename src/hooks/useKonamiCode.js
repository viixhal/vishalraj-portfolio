import { useEffect, useRef } from "react";

const KONAMI_SEQUENCE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export function useKonamiCode(callback) {
  const sequence = useRef([]);

  useEffect(() => {
    const handler = (event) => {
      sequence.current.push(event.key);
      if (sequence.current.length > KONAMI_SEQUENCE.length) sequence.current.shift();
      if (JSON.stringify(sequence.current) === JSON.stringify(KONAMI_SEQUENCE)) {
        callback();
        sequence.current = [];
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [callback]);
}
