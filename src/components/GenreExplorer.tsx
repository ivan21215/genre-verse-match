
import React, { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [selectedGenre, setSelectedGenre] = useState<string>("Cajke");
  const [showNotification, setShowNotification] = useState(false);
  
  // Handle genre button click
  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    onSelectGenre(genre);
    
    // Show notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
    
    // Add vibration feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Play Cajke trumpet sound if the selected genre is Cajke
    if (genre === "Cajke") {
      const audio = new Audio("/trumpet-sound.mp3"); // You'll need to add this sound file
      audio.play().catch(e => console.log("Audio play failed:", e));
    }
  };
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Explore Genres</h2>
      
      {/* Genre buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {genres.map((genre) => (
          <Button
            key={genre.name}
            className={`${genre.color} h-16 text-lg font-semibold ${
              selectedGenre === genre.name ? "ring-2 ring-white" : ""
            }`}
            onClick={() => handleGenreClick(genre.name)}
          >
            <span className="mr-2">{genre.icon}</span>
            {genre.name}
          </Button>
        ))}
      </div>
      
      {/* Selection notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            className="mt-2 p-2 bg-primary/20 rounded text-sm text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {selectedGenre} selected!
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
