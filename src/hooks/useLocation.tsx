
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Geolocation } from '@capacitor/geolocation';

interface LocationHookReturn {
  userLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
}

export const useLocation = (): LocationHookReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getLocationCapacitor = async () => {
      try {
        setIsLoading(true);
        
        // Check permission status first
        const permissionStatus = await Geolocation.checkPermissions();
        
        if (permissionStatus.location !== 'granted') {
          // Request permissions explicitly
          const requestResult = await Geolocation.requestPermissions();
          
          if (requestResult.location !== 'granted') {
            throw new Error("Location permission denied");
          }
        }
        
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 30000, // Increased timeout for better chance of success
          maximumAge: 0
        });
        
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log("Got user location:", userPos);
        setUserLocation(userPos);
        setIsLoading(false);
        
        toast({
          title: "Location Found",
          description: "We've found your location and showing nearby venues.",
        });
      } catch (error) {
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
    };

    // Check if we're running in a Capacitor environment
    const hasCapacitor = typeof window !== 'undefined' && 
                        window.Capacitor !== undefined && 
                        window.Capacitor.isNativePlatform();
    
    if (hasCapacitor) {
      console.log("Using Capacitor geolocation");
      getLocationCapacitor();
    } else {
      console.log("Using browser geolocation");
      // Fallback to browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log("Got user location:", userPos);
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
          },
          {
            enableHighAccuracy: true,
            timeout: 30000, // Increased timeout
            maximumAge: 0
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
    }
  }, [toast]);

  return { userLocation, isLoading };
};

export default useLocation;
