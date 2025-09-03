
import React, { useEffect } from "react";
import { useVenues } from "@/hooks/useVenues";
import useLocation from "@/hooks/useLocation";
import LoadingIndicator from "@/components/LoadingIndicator";
import MapFrame from "@/components/MapFrame";
import VenueList from "@/components/VenueList";
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
  const { getVenuesByGenreAndType } = useVenues();
  const isMobile = useIsMobile();
  
  // Get venues filtered by selected genre and type
  const venues = getVenuesByGenreAndType(selectedGenre, venueType);
  
  // Log user location when it changes
  useEffect(() => {
    if (userLocation) {
      console.log("User location updated:", userLocation);
    }
  }, [userLocation]);
   
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
      {isLoading && <LoadingIndicator />}

      <MapFrame 
        userLocation={userLocation} 
        venues={venues} 
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
        <VenueList selectedGenre={selectedGenre} venueType={venueType} />
      </div>
    </div>
  );
};

export default MapView;
