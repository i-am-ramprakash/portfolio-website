import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface ParallaxSectionProps {
  id?: string;
  className?: string;
  speed?: number;
  children: React.ReactNode;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  id,
  className,
  speed = 0.2,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);

    return (
      <motion.section
        ref={ref}
        id={id}
        className={className}
        style={{
          y,
          willChange: 'transform',
        }}
      >
        {children}
      </motion.section>
    );
};

export default ParallaxSection;