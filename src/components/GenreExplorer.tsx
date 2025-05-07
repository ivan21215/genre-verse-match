
import React, { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// Extended with Croatian genres as prioritized
const genres = [
  { name: "Cajke", color: "bg-genre-cajke", icon: "🎺" },
  { name: "Trash", color: "bg-genre-trash", icon: "🎭" },
  { name: "Electronic", color: "bg-genre-electronic", icon: "🎛️" },
  { name: "Hip Hop", color: "bg-genre-hiphop", icon: "🎤" },
  { name: "Rock", color: "bg-genre-rock", icon: "🎸" },
  { name: "Pop", color: "bg-genre-pop", icon: "🎵" },
  { name: "Jazz", color: "bg-genre-jazz", icon: "🎷" },
  { name: "R&B", color: "bg-genre-rnb", icon: "🎧" },
];

interface GenreExplorerProps {
  onSelectGenre?: (genre: string) => void;
}

const GenreExplorer: React.FC<GenreExplorerProps> = ({ onSelectGenre = () => {} }) => {
  const [currentGenreIndex, setCurrentGenreIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lastSelectionTime, setLastSelectionTime] = useState(0);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const shakeThreshold = 15;
  const shakeTimeout = 1000;
  let lastShakeTime = 0;
  let lastX = 0;
  let lastY = 0;
  let lastZ = 0;
  
  // Handle swipe/drag for genre selection
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    
    // Clear any existing auto-save timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
  };
  
  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const dragDistance = clientX - dragStartX;
    
    // Change genre based on swipe direction
    if (Math.abs(dragDistance) > 50) {
      if (dragDistance > 0 && currentGenreIndex > 0) {
        // Swiped right - previous genre
        setCurrentGenreIndex(currentGenreIndex - 1);
      } else if (dragDistance < 0 && currentGenreIndex < genres.length - 1) {
        // Swiped left - next genre
        setCurrentGenreIndex(currentGenreIndex + 1);
      }
    }
    
    // Start auto-save timer
    setLastSelectionTime(Date.now());
    autoSaveTimer.current = setTimeout(() => {
      onSelectGenre(genres[currentGenreIndex].name);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }, 2000);
  };
  
  // Shake detection for voting
  useEffect(() => {
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!event.acceleration) return;
      
      const { x, y, z } = event.acceleration;
      if (!x || !y || !z) return;
      
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - lastShakeTime;
      
      // Only register a shake once per shakeTimeout period
      if (timeDifference > shakeTimeout) {
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);
        
        if ((deltaX > shakeThreshold && deltaY > shakeThreshold) || 
            (deltaX > shakeThreshold && deltaZ > shakeThreshold) || 
            (deltaY > shakeThreshold && deltaZ > shakeThreshold)) {
          
          // Shake detected - register vote
          handleShakeVote();
          lastShakeTime = currentTime;
        }
      }
      
      lastX = x;
      lastY = y;
      lastZ = z;
    };
    
    // Try to request device motion permissions on iOS
    const requestPermission = async () => {
      if (typeof DeviceMotionEvent !== 'undefined' && 
          typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        } catch (error) {
          console.error('Error requesting device motion permission:', error);
        }
      } else {
        window.addEventListener('devicemotion', handleDeviceMotion);
      }
    };
    
    requestPermission();
    
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [currentGenreIndex]);
  
  const handleShakeVote = () => {
    // Register vote for current genre
    setIsVoting(true);
    
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Play Cajke trumpet sound if the selected genre is Cajke
    if (genres[currentGenreIndex].name === "Cajke") {
      const audio = new Audio("/trumpet-sound.mp3"); // You'll need to add this sound file
      audio.play().catch(e => console.log("Audio play failed:", e));
    }
    
    setTimeout(() => {
      setIsVoting(false);
    }, 1500);
  };
  
  // Auto-fallback to Cajke (genre at index 0) if no interaction
  useEffect(() => {
    const inactivityTimer = setTimeout(() => {
      if (Date.now() - lastSelectionTime > 10000) { // 10 seconds
        setCurrentGenreIndex(0); // Default to Cajke
        onSelectGenre("Cajke");
      }
    }, 10000);
    
    return () => clearTimeout(inactivityTimer);
  }, [lastSelectionTime, onSelectGenre]);
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Explore Genres</h2>
      
      {/* Swipe carousel for genre selection */}
      <div 
        className="relative h-[140px] overflow-hidden"
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGenreIndex}
            className={`genre-tag ${genres[currentGenreIndex].color} p-8 rounded-lg flex items-center justify-center gap-4 cursor-pointer shadow-lg absolute inset-0`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-4xl">{genres[currentGenreIndex].icon}</span>
            <span className="font-medium text-2xl">{genres[currentGenreIndex].name}</span>
            
            {/* Voting animation */}
            {isVoting && (
              <motion.div 
                className="absolute inset-0 bg-white/20 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-2xl">Voting for {genres[currentGenreIndex].name}!</div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Swipe indicators */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {genres.map((_, index) => (
            <div 
              key={index} 
              className={`w-2 h-2 rounded-full ${index === currentGenreIndex ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>
        
        {/* Instructions */}
        <div className="absolute top-2 right-2 text-xs text-white/70">
          Swipe to browse • Shake to vote
        </div>
      </div>
      
      {/* Auto-save notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            className="mt-2 p-2 bg-primary/20 rounded text-sm text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {genres[currentGenreIndex].name} selected!
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-2">Trending Now</h3>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-genre-cajke hover:bg-genre-cajke/80">#CajkeFriday</Badge>
          <Badge className="bg-genre-trash hover:bg-genre-trash/80">#TrashThursday</Badge>
          <Badge className="bg-genre-electronic hover:bg-genre-electronic/80">#TechnoTuesday</Badge>
          <Badge className="bg-genre-hiphop hover:bg-genre-hiphop/80">#90sHipHop</Badge>
          <Badge className="bg-genre-jazz hover:bg-genre-jazz/80">#JazzFusion</Badge>
        </div>
      </div>
    </div>
  );
};

export default GenreExplorer;
