import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RegionalData {
  region: string;
  city: string;
  reviewCount: number;
  averageRating: number;
  rsvpCount: number;
  distance: number;
}

export interface ReviewsByRegion {
  region: string;
  city: string;
  count: number;
  avgRating: number;
  distance: number;
}

export interface RSVPsByRegion {
  region: string;
  city: string;
  count: number;
  goingCount: number;
  interestedCount: number;
  distance: number;
}

export const useRegionalAnalytics = (
  venueId?: string, 
  maxDistanceKm: number = 50,
  startDate?: Date,
  endDate?: Date
) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviewsByRegion, setReviewsByRegion] = useState<ReviewsByRegion[]>([]);
  const [rsvpsByRegion, setRSVPsByRegion] = useState<RSVPsByRegion[]>([]);
  const [venueLocation, setVenueLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchRegionalAnalytics = async (selectedVenueId?: string, filterStartDate?: Date, filterEndDate?: Date) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get venue location
      let venueQuery = supabase
        .from('venues')
        .select('id, latitude, longitude, city, region, name')
        .eq('owner_id', user.id);

      if (selectedVenueId) {
        venueQuery = venueQuery.eq('id', selectedVenueId);
      }

      const { data: venues, error: venuesError } = await venueQuery;
      
      if (venuesError) throw venuesError;
      if (!venues || venues.length === 0) {
        setLoading(false);
        return;
      }

      const targetVenue = venues[0];
      
      if (!targetVenue.latitude || !targetVenue.longitude) {
        console.warn('Venue does not have location coordinates');
        setLoading(false);
        return;
      }

      setVenueLocation({
        lat: Number(targetVenue.latitude),
        lng: Number(targetVenue.longitude)
      });

      // Fetch reviews with location data for this venue
      let reviewsQuery = supabase
        .from('reviews')
        .select('user_city, user_region, user_latitude, user_longitude, rating, created_at')
        .eq('venue_id', targetVenue.id);

      if (filterStartDate) {
        reviewsQuery = reviewsQuery.gte('created_at', filterStartDate.toISOString());
      }

      if (filterEndDate) {
        reviewsQuery = reviewsQuery.lte('created_at', filterEndDate.toISOString());
      }

      const { data: reviews, error: reviewsError } = await reviewsQuery;
      
      if (reviewsError) throw reviewsError;

      // Fetch RSVPs with location data for events at this venue
      let rsvpsQuery = supabase
        .from('event_rsvps')
        .select(`
          user_city,
          user_region,
          user_latitude,
          user_longitude,
          status,
          created_at,
          events!inner(venue_id)
        `)
        .eq('events.venue_id', targetVenue.id);

      if (filterStartDate) {
        rsvpsQuery = rsvpsQuery.gte('created_at', filterStartDate.toISOString());
      }

      if (filterEndDate) {
        rsvpsQuery = rsvpsQuery.lte('created_at', filterEndDate.toISOString());
      }

      const { data: rsvps, error: rsvpsError } = await rsvpsQuery;
      
      if (rsvpsError) throw rsvpsError;

      // Process reviews by region
      const reviewsMap = new Map<string, { count: number; totalRating: number; city: string; distance: number }>();
      
      (reviews || []).forEach(review => {
        if (!review.user_latitude || !review.user_longitude) return;
        
        // Calculate distance from venue
        const distance = calculateDistance(
          Number(targetVenue.latitude),
          Number(targetVenue.longitude),
          Number(review.user_latitude),
          Number(review.user_longitude)
        );

        // Only include reviews within max distance
        if (distance > maxDistanceKm) return;

        const region = review.user_region || review.user_city || 'Unknown';
        const city = review.user_city || 'Unknown';
        
        if (!reviewsMap.has(region)) {
          reviewsMap.set(region, { count: 0, totalRating: 0, city, distance });
        }
        
        const regionData = reviewsMap.get(region)!;
        regionData.count += 1;
        regionData.totalRating += review.rating;
        regionData.distance = Math.min(regionData.distance, distance);
      });

      const reviewsArray: ReviewsByRegion[] = Array.from(reviewsMap.entries()).map(([region, data]) => ({
        region,
        city: data.city,
        count: data.count,
        avgRating: data.totalRating / data.count,
        distance: Math.round(data.distance)
      })).sort((a, b) => b.count - a.count);

      // Process RSVPs by region
      const rsvpsMap = new Map<string, { count: number; going: number; interested: number; city: string; distance: number }>();
      
      (rsvps || []).forEach(rsvp => {
        if (!rsvp.user_latitude || !rsvp.user_longitude) return;
        
        // Calculate distance from venue
        const distance = calculateDistance(
          Number(targetVenue.latitude),
          Number(targetVenue.longitude),
          Number(rsvp.user_latitude),
          Number(rsvp.user_longitude)
        );

        // Only include RSVPs within max distance
        if (distance > maxDistanceKm) return;

        const region = rsvp.user_region || rsvp.user_city || 'Unknown';
        const city = rsvp.user_city || 'Unknown';
        
        if (!rsvpsMap.has(region)) {
          rsvpsMap.set(region, { count: 0, going: 0, interested: 0, city, distance });
        }
        
        const regionData = rsvpsMap.get(region)!;
        regionData.count += 1;
        if (rsvp.status === 'going') regionData.going += 1;
        if (rsvp.status === 'interested') regionData.interested += 1;
        regionData.distance = Math.min(regionData.distance, distance);
      });

      const rsvpsArray: RSVPsByRegion[] = Array.from(rsvpsMap.entries()).map(([region, data]) => ({
        region,
        city: data.city,
        count: data.count,
        goingCount: data.going,
        interestedCount: data.interested,
        distance: Math.round(data.distance)
      })).sort((a, b) => b.count - a.count);

      setReviewsByRegion(reviewsArray);
      setRSVPsByRegion(rsvpsArray);

    } catch (error) {
      console.error('Error fetching regional analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple distance calculation (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg: number) => deg * (Math.PI / 180);

  useEffect(() => {
    if (user) {
      fetchRegionalAnalytics(venueId, startDate, endDate);
    }
  }, [user, venueId, startDate, endDate]);

  return {
    loading,
    reviewsByRegion,
    rsvpsByRegion,
    venueLocation,
    fetchRegionalAnalytics,
    maxDistanceKm
  };
};
