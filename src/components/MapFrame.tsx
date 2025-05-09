
import React, { useEffect, useState } from "react";
import { getGenreColor, launchNavigation } from "@/utils/mapUtils";
import type { Venue } from "@/data/venueData";
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
  
  // Calculate bounds to fit all venues and user location
  const calculateBounds = () => {
    const points = [...venues.map(v => v.location), ...(userLocation ? [userLocation] : [])];
    if (points.length === 0) return "45.815,15.981";
    
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    
    const minLat = Math.min(...lats) - 0.005;
    const maxLat = Math.max(...lats) + 0.005;
    const minLng = Math.min(...lngs) - 0.005;
    const maxLng = Math.max(...lngs) + 0.005;
    
    return `${minLat},${minLng}|${maxLat},${maxLng}`;
  };
  
  // Update venues to include calculated distances from user location
  const updateVenueDistances = () => {
    if (!userLocation) return venues;
    
    // This would update the real distances from user location
    // For now we'll use the mock distances in the data
    console.log("User location:", userLocation.lat, userLocation.lng);
    return venues;
  }
  
  // Fix the Google Maps URL to properly handle multiple locations
  const constructMapUrl = () => {
    if (!userLocation) {
      return;
    }
    
    const center = `${userLocation.lat},${userLocation.lng}`;
    // Calculate markers string for Google Maps
    let markersParam = `&markers=color:red%7Clabel:You%7C${center}`;
    
    // Add all venues as blue markers
    venues.forEach((venue, index) => {
      markersParam += `&markers=color:blue%7Clabel:${index + 1}%7C${venue.location.lat},${venue.location.lng}`;
    });
    
    const url = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${center}&zoom=14${markersParam}`;
    setMapUrl(url);
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
                if (userLocation && venues.length > 0) {
                  // Navigate to the first venue
                  const firstVenue = venues[0];
                  launchNavigation(firstVenue.location.lat, firstVenue.location.lng);
                  
                  toast({
                    title: "Navigation Started",
                    description: `Directions to ${firstVenue.name} have been opened in a new tab.`,
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
