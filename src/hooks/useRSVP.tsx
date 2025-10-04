import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface RSVP {
  id: string;
  user_id: string;
  event_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
  updated_at: string;
}

export const useRSVP = () => {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserRSVPs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRsvps((data || []) as RSVP[]);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch RSVPs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Could not get user location:', error);
          resolve(null);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  };

  const updateRSVP = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to RSVP to events",
        variant: "destructive",
      });
      return;
    }

    try {
      // Try to get user's location
      const location = await getUserLocation();
      
      const rsvpData: any = {
        user_id: user.id,
        event_id: eventId,
        status: status
      };

      if (location) {
        rsvpData.user_latitude = location.latitude;
        rsvpData.user_longitude = location.longitude;
      }

      const { error } = await supabase
        .from('event_rsvps')
        .upsert(rsvpData);

      if (error) throw error;
      
      await fetchUserRSVPs();
      toast({
        title: "RSVP updated",
        description: `You are now marked as "${status}" for this event`,
      });
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    }
  };

  const getRSVPForEvent = (eventId: string): RSVP | undefined => {
    return rsvps.find(rsvp => rsvp.event_id === eventId);
  };

  const getEventRSVPCounts = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('status')
        .eq('event_id', eventId);

      if (error) throw error;

      const counts = {
        going: data?.filter(rsvp => rsvp.status === 'going').length || 0,
        maybe: data?.filter(rsvp => rsvp.status === 'maybe').length || 0,
        not_going: data?.filter(rsvp => rsvp.status === 'not_going').length || 0
      };

      return counts;
    } catch (error) {
      console.error('Error fetching RSVP counts:', error);
      return { going: 0, maybe: 0, not_going: 0 };
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRSVPs();
    }
  }, [user]);

  return {
    rsvps,
    loading,
    updateRSVP,
    getRSVPForEvent,
    getEventRSVPCounts,
    fetchUserRSVPs
  };
};