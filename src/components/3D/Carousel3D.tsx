import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Carousel3DProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const Carousel3D = <T,>({
  items,
  renderItem,
  autoPlay = true,
  autoPlayInterval = 4000,
  className = ''
}: Carousel3DProps<T>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, items.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const getItemPosition = (index: number) => {
    const diff = index - currentIndex;
    const totalItems = items.length;
    
    // Normalize the difference to be between -totalItems/2 and totalItems/2
    let normalizedDiff = diff;
    if (normalizedDiff > totalItems / 2) {
      normalizedDiff -= totalItems;
    } else if (normalizedDiff < -totalItems / 2) {
      normalizedDiff += totalItems;
    }

    const angle = (normalizedDiff * 360) / totalItems;
    const radius = 300;
    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const z = Math.cos((angle * Math.PI) / 180) * radius;
    const scale = z > 0 ? 1 - (z / radius) * 0.5 : 0.5;
    const opacity = z > -radius * 0.7 ? 1 : 0;

    return {
      x,
      z,
      scale,
      opacity,
      rotateY: -angle,
    };
  };

  return (
    <div 
      className={`relative w-full h-96 perspective-1000 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full preserve-3d">
        <AnimatePresence>
          {items.map((item, index) => {
            const position = getItemPosition(index);
            const isActive = index === currentIndex;
            
            return (
              <motion.div
                key={index}
                className="absolute top-1/2 left-1/2 w-64 h-80 cursor-pointer"
                style={{
                  transformOrigin: 'center center',
                  transformStyle: 'preserve-3d',
                }}
                animate={{
                  x: position.x - 128, // Half of width (256px / 2)
                  z: position.z,
                  scale: position.scale,
                  opacity: position.opacity,
                  rotateY: position.rotateY,
                  y: -160, // Half of height (320px / 2)
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                onClick={() => setCurrentIndex(index)}
                whileHover={isActive ? { scale: position.scale * 1.05 } : {}}
              >
                {renderItem(item, index, isActive)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-200 group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-200 group"
      >
        <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? 'bg-primary-500 scale-125'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel3D;