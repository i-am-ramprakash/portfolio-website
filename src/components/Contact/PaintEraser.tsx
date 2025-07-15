import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PaintEraserProps {
  children: React.ReactNode;
  onReveal?: (percentage: number) => void;
  className?: string;
}

const PaintEraser: React.FC<PaintEraserProps> = ({ children, onReveal, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isErasing, setIsErasing] = useState(false);
  const [revealPercentage, setRevealPercentage] = useState(0);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    
    // Create paint overlay with theme-appropriate gradient
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#f8fafc');
    gradient.addColorStop(0.7, '#e2e8f0');
    gradient.addColorStop(1, '#cbd5e1');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add subtle texture
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#64748b' : '#94a3b8';
      ctx.fillRect(
        Math.random() * rect.width,
        Math.random() * rect.height,
        Math.random() * 3,
        Math.random() * 3
      );
    }
    ctx.globalAlpha = 1;

    // Add instructional text
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hover to reveal contact form', rect.width / 2, rect.height / 2 - 20);
    
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Move your cursor over this area', rect.width / 2, rect.height / 2 + 10);
  }, []);

  const calculateRevealPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) { // Alpha channel
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / (pixels.length / 4)) * 100;
    setRevealPercentage(percentage);
    onReveal?.(percentage);
    return percentage;
  }, [onReveal]);

  const erase = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.globalCompositeOperation = 'destination-out';
    
    // Create gradient eraser for smooth effect
    const gradient = ctx.createRadialGradient(
      x * scaleX, y * scaleY, 0,
      x * scaleX, y * scaleY, 40 * Math.min(scaleX, scaleY)
    );
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.7, 'rgba(0,0,0,0.8)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x * scaleX, y * scaleY, 40 * Math.min(scaleX, scaleY), 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalCompositeOperation = 'source-over';
    
    calculateRevealPercentage();
  }, [calculateRevealPercentage]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isErasing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    erase(x, y);
  }, [isErasing, erase]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isErasing) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    erase(x, y);
  }, [isErasing, erase]);

  const handleStart = useCallback(() => {
    setIsErasing(true);
  }, []);

  const handleEnd = useCallback(() => {
    setIsErasing(false);
  }, []);

  useEffect(() => {
    initializeCanvas();
    
    const handleResize = () => {
      setTimeout(initializeCanvas, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Content underneath */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Paint overlay canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-20 cursor-none touch-none"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleStart}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        style={{ 
          pointerEvents: revealPercentage > 80 ? 'none' : 'auto',
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {/* Custom cursor for desktop */}
      <div 
        className="fixed pointer-events-none z-30 hidden md:block"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '2px solid #3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.1s ease',
          opacity: isErasing ? 1 : 0,
        }}
      />
      
      {/* Progress indicator */}
      {revealPercentage > 0 && revealPercentage < 80 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {Math.round(revealPercentage)}% revealed
        </motion.div>
      )}
      
      {/* Mobile instruction */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: revealPercentage < 20 ? 1 : 0, y: 0 }}
          className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
        >
          Touch and drag to reveal
        </motion.div>
      </div>
    </div>
  );
};

export default PaintEraser;