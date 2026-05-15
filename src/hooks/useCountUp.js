import { useEffect, useRef, useState } from "react";

export function useCountUp(target, duration = 900) {
  const numTarget = Number(target) || 0;
  const [value, setValue] = useState(numTarget);
  const prevRef = useRef(numTarget);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = numTarget;
    if (from === to) return;
    cancelAnimationFrame(rafRef.current);
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [numTarget, duration]);

  return value;
}
