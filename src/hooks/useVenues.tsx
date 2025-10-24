import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const venueSchema = z.object({
  name: z.string().trim().min(1, 'Venue name is required').max(200, 'Venue name must be less than 200 characters'),
  address: z.string().trim().min(1, 'Address is required').max(500, 'Address must be less than 500 characters'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  genre: z.string().trim().min(1, 'Genre is required').max(100, 'Genre must be less than 100 characters'),
  venue_type: z.enum(['Venue', 'Club'], { errorMap: () => ({ message: "Venue type must be either 'Venue' or 'Club'" }) }),
  distance: z.string().max(50, 'Distance must be less than 50 characters').optional(),
  venue_code: z.string().max(50, 'Venue code must be less than 50 characters').optional(),
});

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
  image_url?: string;
}

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
        venue_code: venue.venue_code,
        image_url: venue.image_url
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
      // Validate input data
      const validationResult = venueSchema.safeParse(venueData);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0].message;
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { data: null, error: errorMessage };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to create venue');
      
      const venueToInsert = {
        ...validationResult.data,
        owner_id: user.id
      };
      
      const { data, error } = await supabase
        .from('venues')
        .insert([venueToInsert as any])
        .select()
        .single();
        
      if (error) throw error;
      
      await fetchVenues(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create venue';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage };
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