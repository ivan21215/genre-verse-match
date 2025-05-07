
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Sample venues data - in a real app, this would come from an API
  const allVenues: Venue[] = [
    { id: "1", name: "Club Cajke", location: { lat: 45.815, lng: 15.981 }, genre: "Cajke", distance: "0.5km" },
    { id: "2", name: "Trash Disco", location: { lat: 45.813, lng: 15.977 }, genre: "Trash", distance: "0.8km" },
    { id: "3", name: "Pop Palace", location: { lat: 45.810, lng: 15.982 }, genre: "White Girl Music", distance: "1.2km" },
    { id: "4", name: "Techno Temple", location: { lat: 45.817, lng: 15.983 }, genre: "Techno", distance: "0.7km" },
    { id: "5", name: "Hip Hop Haven", location: { lat: 45.814, lng: 15.979 }, genre: "Hip Hop", distance: "0.9km" },
    { id: "6", name: "Rock Republic", location: { lat: 45.812, lng: 15.980 }, genre: "Rock", distance: "1.0km" },
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
  
  useEffect(() => {
    // Initialize map if we have the token, the container is ready, and we have user location
    if (!mapContainer.current || !mapboxToken || !userLocation) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    // Remove existing map if it exists
    if (map.current) {
      map.current.remove();
    }
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [userLocation.lng, userLocation.lat], // Center on user location
      zoom: 14
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );
    
    // Add user location marker
    const userMarkerEl = document.createElement('div');
    userMarkerEl.className = 'user-marker';
    userMarkerEl.style.width = '20px';
    userMarkerEl.style.height = '20px';
    userMarkerEl.style.borderRadius = '50%';
    userMarkerEl.style.backgroundColor = '#4A8FE7';
    userMarkerEl.style.border = '3px solid white';
    userMarkerEl.style.boxShadow = '0 0 0 2px rgba(74, 143, 231, 0.4)';
    
    new mapboxgl.Marker(userMarkerEl)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
    
    // Add markers for venues
    venues.forEach(venue => {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div>
            <h3 style="font-weight: bold; margin-bottom: 5px;">${venue.name}</h3>
            <p style="margin: 0;">${venue.genre}</p>
            <p style="margin: 0;">${venue.distance}</p>
            <p style="margin-top: 5px; font-style: italic;">Press and hold to navigate</p>
          </div>
        `);
        
      // Create a DOM element for the marker
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getGenreColor(venue.genre);
      el.style.cursor = 'pointer';
      el.style.border = '2px solid white';
      
      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([venue.location.lng, venue.location.lat])
        .setPopup(popup)
        .addTo(map.current);
        
      // Add event listener for the marker
      el.addEventListener('mousedown', () => handleVenuePress(venue));
      el.addEventListener('mouseup', handleVenueRelease);
      el.addEventListener('mouseleave', handleVenueRelease);
      el.addEventListener('touchstart', () => handleVenuePress(venue));
      el.addEventListener('touchend', handleVenueRelease);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, userLocation, venues]);

  const getGenreColor = (genre: string): string => {
    switch(genre.toLowerCase()) {
      case 'cajke': return '#FF5733';
      case 'trash': return '#8e24aa';
      case 'white girl music': return '#fb5607';
      case 'techno': return '#118ab2';
      case 'hip hop': return '#ff006e';
      case 'rock': return '#8338ec';
      default: return '#7733FF';
    }
  };
  
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
  
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
      {!mapboxToken ? (
        <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center p-6">
          <h3 className="text-lg font-medium mb-4">Enter your Mapbox token to view the map</h3>
          <p className="text-muted-foreground mb-4 text-sm text-center">
            To use the map, you need a Mapbox access token. You can get one for free at 
            <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
              mapbox.com
            </a>
          </p>
          <input
            type="text"
            placeholder="Enter your Mapbox token"
            className="w-full p-2 border border-border rounded-md mb-4"
            onChange={(e) => setMapboxToken(e.target.value)}
            value={mapboxToken}
          />
          <p className="text-xs text-muted-foreground">
            This is only for demo purposes. In a production app, this would be stored securely on the server.
          </p>
        </div>
      ) : null}
      
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <MapPin className="h-8 w-8 animate-bounce text-primary" />
            <p className="mt-2">Finding your location...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
        style={{ display: mapboxToken ? 'block' : 'none' }} 
      />
      
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
