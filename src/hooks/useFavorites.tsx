import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Favorite {
  id: string;
  user_id: string;
  venue_id: string;
  created_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to fetch favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (venueId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          venue_id: venueId
        });

      if (error) throw error;
      
      await fetchFavorites();
      toast({
        title: "Added to favorites",
        description: "Venue added to your favorites",
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (venueId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('venue_id', venueId);

      if (error) throw error;
      
      await fetchFavorites();
      toast({
        title: "Removed from favorites",
        description: "Venue removed from your favorites",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (venueId: string) => {
    return favorites.some(fav => fav.venue_id === venueId);
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    fetchFavorites
  };
};