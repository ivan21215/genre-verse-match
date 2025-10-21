import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().trim().max(1000, "Comment must be less than 1000 characters").optional(),
});

export interface Review {
  id: string;
  user_id: string;
  venue_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export const useReviews = (venueId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReviews = async (targetVenueId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (targetVenueId) {
        query = query.eq('venue_id', targetVenueId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
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

  const createReview = async (venueId: string, rating: number, comment?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      });
      return { data: null, error: 'Not authenticated' };
    }
    
    try {
      // Validate inputs
      const validation = reviewSchema.safeParse({ rating, comment });
      if (!validation.success) {
        const errorMessage = validation.error.errors[0].message;
        toast({
          title: "Invalid Input",
          description: errorMessage,
          variant: "destructive",
        });
        return { data: null, error: errorMessage };
      }
      // Try to get user's location
      const location = await getUserLocation();
      
      const reviewData: any = {
        user_id: user.id,
        venue_id: venueId,
        rating,
        comment: comment || null
      };

      if (location) {
        reviewData.user_latitude = location.latitude;
        reviewData.user_longitude = location.longitude;
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select('*')
        .single();
        
      if (error) throw error;
      
      setReviews(prev => [data, ...prev]);
      toast({
        title: "Review Added",
        description: "Your review has been posted successfully.",
      });
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create review';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage };
    }
  };

  const updateReview = async (reviewId: string, rating: number, comment?: string) => {
    try {
      // Validate inputs
      const validation = reviewSchema.safeParse({ rating, comment });
      if (!validation.success) {
        const errorMessage = validation.error.errors[0].message;
        toast({
          title: "Invalid Input",
          description: errorMessage,
          variant: "destructive",
        });
        return { data: null, error: errorMessage };
      }
      
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment || null
        })
        .eq('id', reviewId)
        .select('*')
        .single();
        
      if (error) throw error;
      
      setReviews(prev => prev.map(review => review.id === reviewId ? data : review));
      toast({
        title: "Review Updated",
        description: "Your review has been updated successfully.",
      });
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage };
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
        
      if (error) throw error;
      
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted.",
      });
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  const getVenueAverageRating = async (venueId: string): Promise<{ average: number; count: number }> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('venue_id', venueId);
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { average: 0, count: 0 };
      }
      
      const total = data.reduce((sum, review) => sum + review.rating, 0);
      const average = total / data.length;
      
      return { average: Math.round(average * 10) / 10, count: data.length };
    } catch (err) {
      console.error('Failed to get venue rating:', err);
      return { average: 0, count: 0 };
    }
  };

  const getUserReviewForVenue = (venueId: string): Review | null => {
    if (!user) return null;
    return reviews.find(review => review.venue_id === venueId && review.user_id === user.id) || null;
  };

  useEffect(() => {
    if (venueId) {
      fetchReviews(venueId);
    } else {
      fetchReviews();
    }
  }, [venueId]);

  return {
    reviews,
    loading,
    error,
    createReview,
    updateReview,
    deleteReview,
    fetchReviews,
    getVenueAverageRating,
    getUserReviewForVenue,
  };
};