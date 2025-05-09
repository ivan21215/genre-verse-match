
import React from "react";
import { getVenuesByGenreAndType } from "@/data/venueData";
import useLocation from "@/hooks/useLocation";
import LoadingIndicator from "@/components/LoadingIndicator";
import MapFrame from "@/components/MapFrame";
import VenueList from "@/components/VenueList";

interface MapViewProps {
  selectedGenre?: string;
  venueType?: "All" | "Venue" | "Club";
}

const MapView: React.FC<MapViewProps> = ({ 
  selectedGenre = "All",
  venueType = "All"
}) => {
  const { userLocation, isLoading } = useLocation();
  
  // Get venues filtered by selected genre and type
  const venues = getVenuesByGenreAndType(selectedGenre, venueType);
  
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
      {isLoading && <LoadingIndicator />}

      <MapFrame 
        userLocation={userLocation} 
        venues={venues} 
        selectedGenre={selectedGenre}
      />
      
      {/* Venue list below the map */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4">
        <div className="text-sm text-muted-foreground mb-2">
          {selectedGenre === "All" && venueType === "All"
            ? "All Nearby Venues & Clubs:" 
            : selectedGenre === "All"
              ? `All ${venueType === "Club" ? "Clubs" : "Venues"} Near You:`
              : venueType === "All"
                ? `${selectedGenre} Venues & Clubs Near You:`
                : `${selectedGenre} ${venueType === "Club" ? "Clubs" : "Venues"} Near You:`}
        </div>
        <VenueList venues={venues} selectedGenre={selectedGenre} />
      </div>
    </div>
  );
};

export default MapView;
