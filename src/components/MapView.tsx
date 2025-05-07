
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useToast } from "@/hooks/use-toast";

interface Venue {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  genre: string;
  distance: string;
}

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Sample venues data - in a real app, this would come from an API
  const venues: Venue[] = [
    { id: "1", name: "Club Cajke", location: { lat: 45.815, lng: 15.981 }, genre: "Cajke", distance: "0.5km" },
    { id: "2", name: "Trash Disco", location: { lat: 45.813, lng: 15.977 }, genre: "Trash", distance: "0.8km" },
    { id: "3", name: "Pop Palace", location: { lat: 45.810, lng: 15.982 }, genre: "Pop", distance: "1.2km" },
  ];
  
  useEffect(() => {
    // Initialize map if we have the token and the container is ready
    if (!mapContainer.current || !mapboxToken) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [15.981, 45.815], // Center on Zagreb
      zoom: 14
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );
    
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
  }, [mapboxToken]);

  const getGenreColor = (genre: string): string => {
    switch(genre.toLowerCase()) {
      case 'cajke': return '#FF5733';
      case 'trash': return '#33FF57';
      case 'pop': return '#3357FF';
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
    }, 2000);
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
      
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
        style={{ display: mapboxToken ? 'block' : 'none' }} 
      />
      
      {/* Venue list below the map */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4">
        <div className="text-sm text-muted-foreground mb-2">Nearby Venues:</div>
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
      </div>
    </div>
  );
};

export default MapView;
