
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface Venue {
  name: string;
  location: { lat: number; lng: number };
  genre: string;
  distance: string;
}

const MapView = () => {
  const [tiltDirection, setTiltDirection] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Sample venues data
  const venues = [
    { name: "Club Cajke", location: { lat: 45.815, lng: 15.981 }, genre: "Cajke", distance: "0.5km" },
    { name: "Trash Disco", location: { lat: 45.813, lng: 15.977 }, genre: "Trash", distance: "0.8km" },
    { name: "Pop Palace", location: { lat: 45.810, lng: 15.982 }, genre: "Pop", distance: "1.2km" },
  ];
  
  // Handle device tilt for map scrolling
  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma) {
        // Detect left/right tilt
        if (event.gamma > 15) {
          setTiltDirection("right");
        } else if (event.gamma < -15) {
          setTiltDirection("left");
        } else {
          setTiltDirection(null);
        }
      }
    };

    // Try to request device orientation permissions on iOS
    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      } else {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
    
    requestPermission();
    
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);
  
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
  };
  
  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
      <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center">
        {/* Map visualization with scroll effect based on tilt */}
        <div 
          className={`w-full max-w-md px-6 transition-transform duration-300 ${
            tiltDirection === "left" ? "translate-x-4" : tiltDirection === "right" ? "-translate-x-4" : ""
          }`}
        >
          <div className="h-[300px] bg-secondary border border-border rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-muted mb-4 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary animate-pulse"></div>
              </div>
              <div className="text-foreground font-medium">Venues Near You</div>
              <div className="text-sm text-muted-foreground mt-1">Zagreb, Croatia</div>
            </div>
          </div>
        </div>
        
        {/* Venues list that can be scrolled with tilt */}
        <div className="w-full max-w-md mt-4 px-6">
          <div className="text-sm text-muted-foreground mb-2">Nearby Venues:</div>
          <div className="space-y-2">
            {venues.map((venue, index) => (
              <motion.div
                key={index}
                className={`p-2 border border-border rounded-lg flex justify-between items-center ${
                  selectedVenue?.name === venue.name && longPressActive ? "bg-primary/20" : ""
                }`}
                onTouchStart={() => handleVenuePress(venue)}
                onTouchEnd={handleVenueRelease}
                onMouseDown={() => handleVenuePress(venue)}
                onMouseUp={handleVenueRelease}
                onMouseLeave={handleVenueRelease}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <div className="font-medium">{venue.name}</div>
                  <div className="text-xs text-muted-foreground">{venue.genre} • {venue.distance}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedVenue?.name === venue.name && longPressActive ? "Launching Maps..." : "Hold to Navigate"}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
