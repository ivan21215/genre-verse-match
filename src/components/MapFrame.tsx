
import React, { useEffect, useState } from "react";
import type { Venue } from "@/data/venueData";
import { getGenreColor, launchNavigation } from "@/utils/mapUtils";
import { Navigation, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface MapFrameProps {
  userLocation: { lat: number; lng: number } | null;
  venues: Venue[];
  selectedGenre: string;
}

const MapFrame: React.FC<MapFrameProps> = ({ userLocation, venues, selectedGenre }) => {
  const { toast } = useToast();
  const [mapUrl, setMapUrl] = useState<string>("");

  useEffect(() => {
    // Only update map when we have user location or venues
    if (userLocation) {
      constructMapUrl();
    }
  }, [userLocation, venues, selectedGenre]);
  
  // Fix the Google Maps URL to properly handle location visualization
  const constructMapUrl = () => {
    if (!userLocation) {
      return;
    }
    
    // Since Google Maps Embed API doesn't support multiple markers in the way we tried,
    // we'll use a simpler approach that just centers the map on the user's location
    const center = `${userLocation.lat},${userLocation.lng}`;
    const zoom = 14; // Appropriate zoom level to see nearby venues
    
    const url = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${center}&zoom=${zoom}`;
    setMapUrl(url);
  };

  // Find the nearest venue for navigation
  const findNearestVenue = (): Venue | null => {
    if (venues.length === 0) return null;
    
    // In a real app, we would calculate actual distances from user location
    // For now, we just return the first venue in the list
    return venues[0];
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="relative flex-grow">
        {mapUrl && (
          <iframe
            title="Google Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapUrl}
          ></iframe>
        )}
        
        {/* User location indicator */}
        {userLocation && (
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-2 rounded shadow-md text-sm z-10">
            <div className="font-medium text-primary">Your Location</div>
            <div className="text-xs text-muted-foreground">
              {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </div>
          </div>
        )}
        
        {/* Navigation control */}
        {venues.length > 0 && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button 
              variant="default"
              className="bg-primary/90 backdrop-blur-sm shadow-lg"
              onClick={() => {
                const nearestVenue = findNearestVenue();
                if (userLocation && nearestVenue) {
                  launchNavigation(nearestVenue.location.lat, nearestVenue.location.lng);
                  
                  toast({
                    title: "Navigation Started",
                    description: `Directions to ${nearestVenue.name} have been opened in a new tab.`,
                  });
                }
              }}
            >
              <Navigation className="mr-1" />
              Navigate to nearest
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapFrame;
