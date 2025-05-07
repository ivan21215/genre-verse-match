
import React from "react";
import { Badge } from "@/components/ui/badge";

const genres = [
  { name: "Electronic", color: "bg-genre-electronic", icon: "🎛️" },
  { name: "Hip Hop", color: "bg-genre-hiphop", icon: "🎤" },
  { name: "Rock", color: "bg-genre-rock", icon: "🎸" },
  { name: "Pop", color: "bg-genre-pop", icon: "🎵" },
  { name: "Jazz", color: "bg-genre-jazz", icon: "🎷" },
  { name: "R&B", color: "bg-genre-rnb", icon: "🎧" },
  { name: "Techno", color: "bg-genre-techno", icon: "⚡" },
  { name: "House", color: "bg-genre-house", icon: "🏠" }
];

interface GenreExplorerProps {
  onSelectGenre?: (genre: string) => void;
}

const GenreExplorer: React.FC<GenreExplorerProps> = ({ onSelectGenre = () => {} }) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Explore Genres</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {genres.map((genre) => (
          <div
            key={genre.name}
            onClick={() => onSelectGenre(genre.name)}
            className={`genre-tag ${genre.color} p-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl`}
          >
            <span className="text-2xl">{genre.icon}</span>
            <span className="font-medium">{genre.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-2">Trending Now</h3>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-genre-electronic hover:bg-genre-electronic/80">#TechnoTuesday</Badge>
          <Badge className="bg-genre-hiphop hover:bg-genre-hiphop/80">#90sHipHop</Badge>
          <Badge className="bg-genre-house hover:bg-genre-house/80">#DeepHouse</Badge>
          <Badge className="bg-genre-jazz hover:bg-genre-jazz/80">#JazzFusion</Badge>
          <Badge className="bg-genre-pop hover:bg-genre-pop/80">#SummerPop</Badge>
        </div>
      </div>
    </div>
  );
};

export default GenreExplorer;
