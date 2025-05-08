
import React from "react";
import { getGenreColor, launchNavigation } from "@/utils/mapUtils";
import type { Venue } from "@/data/venueData";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "./ui/button";

interface MapFrameProps {
  userLocation: { lat: number; lng: number } | null;
  venues: Venue[];
  selectedGenre: string;
}

const MapFrame: React.FC<MapFrameProps> = ({ userLocation, venues, selectedGenre }) => {
  const center = userLocation ? `${userLocation.lat},${userLocation.lng}` : '45.815,15.981';
  
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
  
  // Use viewport based on venues if available
  const viewport = venues.length > 0 ? calculateBounds() : center;
  
  // Generate markers for venues
  const getMarkers = () => {
    return venues.map(venue => {
      const color = encodeURIComponent(getGenreColor(venue.genre).replace('#', ''));
      return `&markers=color:${color}|label:${venue.name.charAt(0)}|${venue.location.lat},${venue.location.lng}`;
    }).join('');
  };
  
  // Generate user location marker
  const getUserMarker = () => {
    return userLocation ? `&markers=color:blue|label:Y|${userLocation.lat},${userLocation.lng}` : '';
  };

  // Construct map URL
  const mapUrl = venues.length > 0 
    ? `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${center}&zoom=15${getMarkers()}${getUserMarker()}`
    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${center}&zoom=15`;

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="relative flex-grow">
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapUrl}
        ></iframe>
        
        {/* Navigation control */}
        <div className="absolute bottom-4 right-4 z-10">
          <Button 
            variant="default"
            className="bg-primary/90 backdrop-blur-sm shadow-lg"
            onClick={() => {
              if (userLocation) {
                if (venues.length === 1) {
                  // Navigate to the only venue
                  launchNavigation(venues[0].location.lat, venues[0].location.lng);
                } else if (venues.length > 0) {
                  // Navigate to the first venue of selected genre
                  const firstVenue = venues.find(v => selectedGenre === "All" || v.genre === selectedGenre);
                  if (firstVenue) {
                    launchNavigation(firstVenue.location.lat, firstVenue.location.lng);
                  }
                }
              }
            }}
          >
            <Navigation className="mr-1" />
            Navigate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapFrame;
