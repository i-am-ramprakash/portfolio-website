import { type CSSProperties, type PropsWithChildren, useEffect, useRef, useState } from "react";

interface RevealProps extends PropsWithChildren {
  className?: string;
  characterAnchor?: boolean;
  delay?: number;
  reducedMotion?: boolean;
}

const Reveal = ({
  children,
  className = "",
  characterAnchor = false,
  delay = 0,
  reducedMotion = false,
}: RevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || reducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={elementRef}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      data-character-anchor={characterAnchor ? "" : undefined}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
};

export default Reveal;
