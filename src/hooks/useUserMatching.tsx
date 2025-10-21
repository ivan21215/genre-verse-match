import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const preferenceSchema = z.object({
  genre: z.string().trim().min(1, "Genre is required").max(100, "Genre must be less than 100 characters"),
  age: z.number().int().min(13, "Age must be at least 13").max(120, "Age must be realistic"),
  gender: z.string().trim().min(1, "Gender is required").max(50, "Gender must be less than 50 characters"),
  event_location: z.string().trim().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  event_date: z.string().trim().min(1, "Event date is required"),
  additional_info: z.string().trim().max(500, "Additional info must be less than 500 characters").optional(),
});

export interface UserPreference {
  id: string;
  user_id: string;
  genre: string;
  age: number;
  gender: string;
  event_location: string;
  event_date: string;
  additional_info?: string;
  created_at: string;
  updated_at: string;
}

export interface UserMatch extends UserPreference {
  profile?: {
    name: string;
  };
}

export const useUserMatching = () => {
  const [loading, setLoading] = useState(false);
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [matches, setMatches] = useState<UserMatch[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user's own preference
  const fetchUserPreference = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_event_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setUserPreference(data);
    } catch (error) {
      console.error('Error fetching user preference:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save or update user preference
  const savePreference = async (preference: Omit<UserPreference, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('User not authenticated') };

    setLoading(true);
    try {
      // Validate inputs
      const validation = preferenceSchema.safeParse(preference);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0].message;
        toast({
          title: "Invalid Input",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: new Error(errorMessage) };
      }
      // Check if user already has a preference
      const { data: existing } = await supabase
        .from('user_event_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing preference
        const { error } = await supabase
          .from('user_event_preferences')
          .update(preference)
          .eq('id', existing.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your preferences have been updated",
        });
      } else {
        // Create new preference
        const { error } = await supabase
          .from('user_event_preferences')
          .insert([{ ...preference, user_id: user.id }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your preferences have been saved",
        });
      }

      await fetchUserPreference();
      return { error: null };
    } catch (error: any) {
      console.error('Error saving preference:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Find matching users
  const findMatches = async () => {
    if (!user || !userPreference) return;

    setLoading(true);
    try {
      // Calculate age range (±5 years)
      const minAge = userPreference.age - 5;
      const maxAge = userPreference.age + 5;

      // Query matching users
      const { data, error } = await supabase
        .from('user_event_preferences')
        .select(`
          *,
          profiles:user_id (
            name
          )
        `)
        .eq('genre', userPreference.genre)
        .eq('event_date', userPreference.event_date)
        .gte('age', minAge)
        .lte('age', maxAge)
        .neq('user_id', user.id);

      if (error) throw error;

      // Filter by location similarity (simple string match for now)
      const locationMatches = (data || []).filter(match => {
        const userLocation = userPreference.event_location.toLowerCase();
        const matchLocation = match.event_location.toLowerCase();
        return matchLocation.includes(userLocation) || userLocation.includes(matchLocation);
      });

      setMatches(locationMatches.map(match => ({
        ...match,
        profile: Array.isArray(match.profiles) ? match.profiles[0] : match.profiles
      })));

      if (locationMatches.length === 0) {
        toast({
          title: "No Matches Found",
          description: "Try adjusting your preferences or check back later",
        });
      }
    } catch (error) {
      console.error('Error finding matches:', error);
      toast({
        title: "Error",
        description: "Failed to find matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPreference();
    }
  }, [user]);

  return {
    loading,
    userPreference,
    matches,
    savePreference,
    findMatches,
  };
};
