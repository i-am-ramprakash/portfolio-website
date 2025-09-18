import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterRevealProps {
  children: React.ReactNode;
  className?: string;
}

const TypewriterReveal: React.FC<TypewriterRevealProps> = ({ children, className = '' }) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealStage, setRevealStage] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const messages = [
    "Initializing contact protocol...",
    "Loading secure connection...",
    "Preparing contact form...",
    "Ready to connect!"
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isRevealing && revealStage < messages.length) {
      interval = setTimeout(() => {
        setRevealStage(prev => prev + 1);
      }, 800);
    }
    return () => clearTimeout(interval);
  }, [isRevealing, revealStage, messages.length]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  const handleMouseEnter = () => {
    if (!isRevealing) {
      setIsRevealing(true);
      setRevealStage(0);
    }
  };

  const isFullyRevealed = revealStage >= messages.length;

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* Content underneath */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isFullyRevealed ? 1 : 0.1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
      
      {/* Typewriter overlay */}
      <AnimatePresence>
        {!isFullyRevealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl flex items-center justify-center"
          >
            <div className="text-center max-w-md px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto mb-8 bg-primary-600 rounded-full flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                />
              </motion.div>

              <div className="font-mono text-green-400 text-lg mb-4 h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {messages.slice(0, revealStage + 1).map((message, index) => (
                    index === revealStage ? (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center"
                      >
                        {message}
                        {showCursor && <span className="ml-1 text-white">|</span>}
                      </motion.span>
                    ) : null
                  ))}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                {messages.map((_, index) => (
                  <motion.div
                    key={index}
                    className="h-1 bg-gray-700 rounded-full overflow-hidden"
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: index <= revealStage ? 1 : 0.3 
                    }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: index < revealStage ? "100%" : index === revealStage ? "100%" : "0%" 
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </motion.div>
                ))}
              </div>

              {!isRevealing && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-400 text-sm mt-6"
                >
                  Hover to initialize contact sequence
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success message */}
      <AnimatePresence>
        {isFullyRevealed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 z-30 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
          >
            ✓ Contact form activated!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TypewriterReveal;