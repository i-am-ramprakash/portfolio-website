import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  intensity?: number;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ 
  children, 
  className = '', 
  delay = 0, 
  intensity = 1 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const [{ transform }, set] = useSpring(() => ({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    config: { mass: 1, tension: 170, friction: 26 }
  }));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10 * intensity;
    const rotateY = ((x - centerX) / centerX) * 10 * intensity;

    set({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    });
  };

  const handleMouseLeave = () => {
    set({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="transform-gpu"
    >
      <animated.div
        ref={cardRef}
        style={{ transform }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`transform-gpu transition-shadow duration-300 hover:shadow-2xl ${className}`}
      >
        {children}
      </animated.div>
    </motion.div>
  );
};

export default FloatingCard;