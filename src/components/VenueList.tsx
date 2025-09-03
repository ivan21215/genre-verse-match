
import React from "react";
import type { Venue } from "@/hooks/useVenues";
import { useVenues } from "@/hooks/useVenues";
import { getGenreColor, launchNavigation } from "@/utils/mapUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface VenueListProps {
  selectedGenre: string;
  venueType?: "All" | "Venue" | "Club";
}

const VenueList: React.FC<VenueListProps> = ({ selectedGenre, venueType = "All" }) => {
  const { getVenuesByGenreAndType } = useVenues();
  const { toast } = useToast();
  
  const venues = getVenuesByGenreAndType(selectedGenre, venueType);

  const handleNavigate = (venue: Venue) => {
    launchNavigation(venue.location.lat, venue.location.lng);
    
    toast({
      title: "Navigation Started",
      description: `Directions to ${venue.name} have been opened in a new tab.`,
    });
  };

  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {venues.length === 0 ? (
        <div className="p-2 text-sm text-center">
          No venues or clubs found for this genre nearby. Try another genre!
        </div>
      ) : (
        venues.map((venue) => (
          <div
            key={venue.id}
            className="p-2 border border-border rounded-lg flex justify-between items-center"
            style={{ borderLeft: `4px solid ${getGenreColor(venue.genre)}` }}
          >
            <div>
              <div className="font-medium">{venue.name}</div>
              <div className="text-xs text-muted-foreground">
                {venue.genre} • {venue.distance} • {venue.type}
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleNavigate(venue)}
              className="flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              Navigate
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default VenueList;
