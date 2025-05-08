
import React, { useRef } from "react";
import type { Venue } from "@/data/venueData";
import { getGenreColor, launchNavigation } from "@/utils/mapUtils";
import { useToast } from "@/hooks/use-toast";

interface VenueListProps {
  venues: Venue[];
  selectedGenre: string;
}

const VenueList: React.FC<VenueListProps> = ({ venues, selectedGenre }) => {
  const [selectedVenue, setSelectedVenue] = React.useState<Venue | null>(null);
  const [longPressActive, setLongPressActive] = React.useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleVenuePress = (venue: Venue) => {
    setSelectedVenue(venue);
    
    // Clear any existing timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true);
      launchNavigation(venue.location.lat, venue.location.lng);
      
      toast({
        title: "Navigation Started",
        description: `Directions to ${venue.name} have been opened in a new tab.`,
      });
    }, 1000); // 1 second for better user experience
  };
  
  const handleVenueRelease = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setLongPressActive(false);
  };

  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {venues.length === 0 ? (
        <div className="p-2 text-sm text-center">
          No venues found for this genre nearby. Try another genre!
        </div>
      ) : (
        venues.map((venue) => (
          <div
            key={venue.id}
            className={`p-2 border border-border rounded-lg flex justify-between items-center transition-colors ${
              selectedVenue?.id === venue.id && longPressActive ? "bg-primary/20" : ""
            }`}
            onTouchStart={() => handleVenuePress(venue)}
            onTouchEnd={handleVenueRelease}
            onMouseDown={() => handleVenuePress(venue)}
            onMouseUp={handleVenueRelease}
            onMouseLeave={handleVenueRelease}
            style={{ borderLeft: `4px solid ${getGenreColor(venue.genre)}` }}
          >
            <div>
              <div className="font-medium">{venue.name}</div>
              <div className="text-xs text-muted-foreground">{venue.genre} • {venue.distance}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedVenue?.id === venue.id && longPressActive ? "Launching Maps..." : "Hold to Navigate"}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default VenueList;
