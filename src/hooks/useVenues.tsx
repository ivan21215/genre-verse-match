import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Venue {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  genre: string;
  distance: string;
  type: "Venue" | "Club";
  owner_id?: string;
  address?: string;
  subscription_plan?: string;
  venue_code?: string;
}

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('venues')
        .select('*');
        
      if (error) throw error;
      
      const transformedVenues: Venue[] = (data || []).map(venue => ({
        id: venue.id,
        name: venue.name,
        location: { lat: venue.latitude || 0, lng: venue.longitude || 0 },
        genre: venue.genre,
        distance: venue.distance || '0km',
        type: venue.venue_type as "Venue" | "Club",
        owner_id: venue.owner_id,
        address: venue.address,
        subscription_plan: venue.subscription_plan,
        venue_code: venue.venue_code
      }));
      
      setVenues(transformedVenues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const getVenuesByGenre = (genre: string): Venue[] => {
    return genre === "All" 
      ? venues 
      : venues.filter(venue => venue.genre === genre);
  };

  const getVenuesByType = (type: "Venue" | "Club" | "All"): Venue[] => {
    return type === "All" 
      ? venues 
      : venues.filter(venue => venue.type === type);
  };

  const getVenuesByGenreAndType = (genre: string, type: "Venue" | "Club" | "All"): Venue[] => {
    const venuesByGenre = getVenuesByGenre(genre);
    return type === "All" 
      ? venuesByGenre 
      : venuesByGenre.filter(venue => venue.type === type);
  };

  const createVenue = async (venueData: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    genre: string;
    venue_type: 'Venue' | 'Club';
    distance?: string;
    venue_code?: string;
  }) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to create venue');
      
      const venueToInsert = {
        ...venueData,
        owner_id: user.id
      };
      
      const { data, error } = await supabase
        .from('venues')
        .insert([venueToInsert])
        .select()
        .single();
        
      if (error) throw error;
      
      await fetchVenues(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create venue' };
    }
  };

  return {
    venues,
    loading,
    error,
    fetchVenues,
    getVenuesByGenre,
    getVenuesByType,
    getVenuesByGenreAndType,
    createVenue
  };
};