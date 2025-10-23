'use client';
import { useEffect, useRef } from "react";

interface ScrollObserverProps {
  onVisible: () => void;
  disabled?: boolean; 
  rootMargin?: string;
}

const ScrollObserver: React.FC<ScrollObserverProps> = ({
  onVisible,
  disabled = false,
  rootMargin = "100px",
}) => {


  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          onVisible();
        }
      },
      {
        root: null, // viewport
        rootMargin,
        threshold: 0.1,
      }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [disabled, onVisible, rootMargin]);

  return <div ref={ref} className="intersection w-full h-12"></div>;
};

export default ScrollObserver;