
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface LocationHookReturn {
  userLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
}

export const useLocation = (): LocationHookReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

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

  return { userLocation, isLoading };
};

export default useLocation;
