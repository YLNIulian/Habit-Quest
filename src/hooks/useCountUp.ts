import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";

/** Animates a displayed number towards `target`, easing out. For counters like altitude. */
export function useCountUp(target: number, duration = 650): number {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    if (reduced) {
      from.current = target;
      return;
    }
    let frame = 0;
    const t0 = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(start + (target - start) * eased);
      from.current = value;
      setShown(value);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);

  // With Reduce Motion the number simply jumps.
  return reduced ? target : shown;
}
