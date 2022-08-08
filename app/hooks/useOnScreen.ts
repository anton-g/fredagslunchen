import type { MutableRefObject } from "react";
import { useState, useEffect } from "react";

export function useOnScreen<T extends Element>(
  ref: MutableRefObject<T>,
  rootMargin: string = "0px"
): boolean {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);
  useEffect(() => {
    const observedElement = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );
    if (observedElement) {
      observer.observe(observedElement);
    }
    return () => {
      observer.unobserve(observedElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return isIntersecting;
}
