
import React, { useEffect, useState } from "react";
import { getVenuesByGenreAndType } from "@/data/venueData";
import useLocation from "@/hooks/useLocation";
import LoadingIndicator from "@/components/LoadingIndicator";
import MapFrame from "@/components/MapFrame";
import VenueList from "@/components/VenueList";
import type { Venue } from "@/data/venueData";
import { useIsMobile } from "@/hooks/use-mobile";

interface MapViewProps {
  selectedGenre?: string;
  venueType?: "All" | "Venue" | "Club";
}

const MapView: React.FC<MapViewProps> = ({ 
  selectedGenre = "All",
  venueType = "All"
}) => {
  const { userLocation, isLoading } = useLocation();
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const isMobile = useIsMobile();
  
  // Get venues filtered by selected genre and type
  const venues = getVenuesByGenreAndType(selectedGenre, venueType);
  
  // When user location or venues change, update the list of nearby venues
  useEffect(() => {
    if (userLocation) {
      // In a real app, we would filter venues based on proximity to user
      // For now, we're using the mock data but logging the user's location
      console.log("User location updated:", userLocation);
      setNearbyVenues(venues);
    }
  }, [userLocation, venues]);
  
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
      {isLoading && <LoadingIndicator />}

      <MapFrame 
        userLocation={userLocation} 
        venues={nearbyVenues} 
        selectedGenre={selectedGenre}
      />
      
      <div className={`absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="text-sm text-muted-foreground mb-2">
          {selectedGenre === "All" && venueType === "All"
            ? "All Nearby Venues & Clubs:" 
            : selectedGenre === "All"
              ? `All ${venueType === "Club" ? "Clubs" : "Venues"} Near You:`
              : venueType === "All"
                ? `${selectedGenre} Venues & Clubs Near You:`
                : `${selectedGenre} ${venueType === "Club" ? "Clubs" : "Venues"} Near You:`}
        </div>
        <VenueList venues={nearbyVenues} selectedGenre={selectedGenre} />
      </div>
    </div>
  );
};

export default MapView;
