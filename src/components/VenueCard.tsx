
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Music, User } from "lucide-react";

interface VenueCardProps {
  name: string;
  image: string;
  address: string;
  event?: string;
  genres: string[];
  attendees: number;
}

const getGenreColor = (genre: string): string => {
  const genreMap: Record<string, string> = {
    "Electronic": "bg-genre-electronic",
    "Hip Hop": "bg-genre-hiphop",
    "Rock": "bg-genre-rock",
    "Pop": "bg-genre-pop",
    "Jazz": "bg-genre-jazz",
    "R&B": "bg-genre-rnb",
    "Techno": "bg-genre-techno",
    "House": "bg-genre-house",
  };
  
  return genreMap[genre] || "bg-primary";
};

const VenueCard: React.FC<VenueCardProps> = ({
  name,
  image,
  address,
  event,
  genres,
  attendees
}) => {
  return (
    <div className="venue-card relative rounded-xl overflow-hidden shadow-lg group h-[280px]">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-venue"></div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-sm text-gray-300 mb-2">{address}</p>
        
        {/* Event details if available */}
        {event && (
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{event}</span>
          </div>
        )}
        
        {/* Genres */}
        <div className="flex flex-wrap gap-1 mb-3">
          {genres.map((genre) => (
            <Badge 
              key={genre} 
              className={`${getGenreColor(genre)} text-xs`}
            >
              {genre}
            </Badge>
          ))}
        </div>
        
        {/* Attendee count */}
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span className="text-xs">{attendees} attending</span>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
