import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, RotateCcw, Trophy, Lock, Unlock } from 'lucide-react';

interface PuzzleGameProps {
  onComplete: () => void;
  isCompleted: boolean;
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({ onComplete, isCompleted }) => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const initializePuzzle = () => {
    const initialTiles = Array.from({ length: 8 }, (_, i) => i + 1).concat([0]);
    const shuffled = [...initialTiles];
    
    // Shuffle the array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setTiles(shuffled);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initializePuzzle();
  }, []);

  const checkWin = (currentTiles: number[]) => {
    const winCondition = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    return currentTiles.every((tile, index) => tile === winCondition[index]);
  };

  const moveTile = (index: number) => {
    if (isWon) return;

    const emptyIndex = tiles.indexOf(0);
    const canMove = [
      emptyIndex - 1, emptyIndex + 1, // horizontal
      emptyIndex - 3, emptyIndex + 3  // vertical
    ].includes(index) && 
    !(emptyIndex % 3 === 0 && index === emptyIndex - 1) && 
    !(emptyIndex % 3 === 2 && index === emptyIndex + 1);

    if (canMove) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setMoves(moves + 1);

      if (checkWin(newTiles)) {
        setIsWon(true);
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    }
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center p-6 bg-green-100 dark:bg-green-900 rounded-xl border-2 border-green-500"
      >
        <Unlock className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
          Puzzle Solved! 🎉
        </h3>
        <p className="text-green-700 dark:text-green-300">
          Contact information is now unlocked!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-6">
        <Lock className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Unlock Contact Info
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Solve this sliding puzzle to access my contact details!
        </p>
        
        {!showGame ? (
          <button
            onClick={() => setShowGame(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Start Puzzle Challenge
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Moves: {moves}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={initializePuzzle}
                  className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={initializePuzzle}
                  className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {tiles.map((tile, index) => (
                <motion.button
                  key={index}
                  onClick={() => moveTile(index)}
                  className={`
                    aspect-square flex items-center justify-center text-xl font-bold rounded-lg transition-all
                    ${tile === 0 
                      ? 'bg-transparent' 
                      : 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 cursor-pointer'
                    }
                  `}
                  whileHover={tile !== 0 ? { scale: 1.05 } : {}}
                  whileTap={tile !== 0 ? { scale: 0.95 } : {}}
                >
                  {tile !== 0 && tile}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {isWon && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg"
                >
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-green-800 dark:text-green-200 font-semibold">
                    Congratulations! Unlocking contact info...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleGame;