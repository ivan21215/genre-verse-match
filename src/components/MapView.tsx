
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";

interface Venue {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  genre: string;
  distance: string;
}

interface MapViewProps {
  selectedGenre?: string;
}

const MapView: React.FC<MapViewProps> = ({ selectedGenre = "All" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Sample venues data - in a real app, this would come from an API
  const allVenues: Venue[] = [
    { id: "1", name: "Club Cajke", location: { lat: 45.815, lng: 15.981 }, genre: "Cajke", distance: "0.5km" },
    { id: "2", name: "Trash Disco", location: { lat: 45.813, lng: 15.977 }, genre: "Trash", distance: "0.8km" },
    { id: "3", name: "Pop Palace", location: { lat: 45.810, lng: 15.982 }, genre: "White Girl Music", distance: "1.2km" },
    { id: "4", name: "Techno Temple", location: { lat: 45.817, lng: 15.983 }, genre: "Techno", distance: "0.7km" },
    { id: "5", name: "Hip Hop Haven", location: { lat: 45.814, lng: 15.979 }, genre: "Hip Hop", distance: "0.9km" },
    { id: "6", name: "Rock Republic", location: { lat: 45.812, lng: 15.980 }, genre: "Rock", distance: "1.0km" },
    { id: "7", name: "Rap Tavern", location: { lat: 45.816, lng: 15.984 }, genre: "Rap", distance: "0.6km" },
    { id: "8", name: "Dance Arena", location: { lat: 45.818, lng: 15.986 }, genre: "Dance", distance: "1.1km" },
    { id: "9", name: "Jazz Corner", location: { lat: 45.811, lng: 15.978 }, genre: "Jazz", distance: "0.7km" },
  ];
  
  // Filter venues based on selected genre
  const venues = selectedGenre === "All" 
    ? allVenues 
    : allVenues.filter(venue => venue.genre === selectedGenre);
  
  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setIsLoading(false);
          
          toast({
            title: "Location Found",
            description: "We've found your location and showing nearby venues.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
          
          // Default to Zagreb if location access is denied
          setUserLocation({ lat: 45.815, lng: 15.981 });
          
          toast({
            title: "Location Access Denied",
            description: "We're using a default location. Please enable location services for better results.",
            variant: "destructive"
          });
        }
      );
    } else {
      setIsLoading(false);
      setUserLocation({ lat: 45.815, lng: 15.981 }); // Default to Zagreb
      
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation. We're using a default location.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Handle long press to launch navigation
  const handleVenuePress = (venue: Venue) => {
    setSelectedVenue(venue);
    
    // Clear any existing timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true);
      launchNavigation(venue);
    }, 1000); // Reduced to 1 second for better user experience
  };
  
  const handleVenueRelease = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setLongPressActive(false);
  };
  
  const launchNavigation = (venue: Venue) => {
    // Determine which map app to use based on platform
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${venue.location.lat},${venue.location.lng}`;
    window.open(mapUrl, '_blank');
    
    // Add vibration feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    toast({
      title: "Navigation Started",
      description: `Directions to ${venue.name} have been opened in a new tab.`,
    });
  };

  const getGenreColor = (genre: string): string => {
    switch(genre.toLowerCase()) {
      case 'cajke': return '#FF5733';
      case 'trash': return '#8e24aa';
      case 'white girl music': return '#fb5607';
      case 'techno': return '#118ab2';
      case 'hip hop': return '#ff006e';
      case 'rock': return '#8338ec';
      case 'rap': return '#f97316';
      case 'dance': return '#ec4899';
      case 'jazz': return '#f59e0b';
      default: return '#7733FF';
    }
  };
  
  // Create Google Maps URL with pins for venues
  const getGoogleMapsUrl = () => {
    // Default to Zagreb if no user location
    const center = userLocation ? `${userLocation.lat},${userLocation.lng}` : '45.815,15.981';
    let mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${center}&zoom=15`;
    
    return mapUrl;
  };
  
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <MapPin className="h-8 w-8 animate-bounce text-primary" />
            <p className="mt-2">Finding your location...</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0">
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={getGoogleMapsUrl()}
        ></iframe>
      </div>
      
      {/* Venue list below the map */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4">
        <div className="text-sm text-muted-foreground mb-2">
          {selectedGenre === "All" 
            ? "All Nearby Venues:" 
            : `${selectedGenre} Venues Near You:`}
        </div>
        {venues.length === 0 ? (
          <div className="p-2 text-sm text-center">
            No venues found for this genre nearby. Try another genre!
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {venues.map((venue) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
