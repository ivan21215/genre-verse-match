import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().max(2000, 'Description must be less than 2000 characters').optional().or(z.literal('')),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional().or(z.literal('')),
  genre: z.string().trim().min(1, 'Genre is required').max(100, 'Genre must be less than 100 characters'),
  venue_id: z.string().uuid('Invalid venue ID'),
  max_attendees: z.number().int().positive('Max attendees must be positive').optional().or(z.null()),
});

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  genre: string;
  venue_id: string;
  max_attendees: number | null;
  attendees: number | null;
  created_at: string;
  updated_at: string;
  venues?: {
    id: string;
    name: string;
    address: string;
    owner_id: string;
  };
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venues (
            id,
            name,
            address,
            owner_id
          )
        `)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });
        
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchVenueEvents = async (venueId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venues (
            id,
            name,
            address,
            owner_id
          )
        `)
        .eq('venue_id', venueId)
        .order('event_date', { ascending: true });
        
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch venue events');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVenueEvents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venues!inner (
            id,
            name,
            address,
            owner_id
          )
        `)
        .eq('venues.owner_id', user.id)
        .order('event_date', { ascending: true });
        
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch your events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: {
    title: string;
    description?: string;
    event_date: string;
    start_time: string;
    end_time?: string;
    genre: string;
    venue_id: string;
    max_attendees?: number;
  }) => {
    try {
      // Validate input data
      const validationResult = eventSchema.safeParse(eventData);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0].message;
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { data: null, error: errorMessage };
      }

      const { data, error } = await supabase
        .from('events')
        .insert([validationResult.data as any])
        .select(`
          *,
          venues (
            id,
            name,
            address,
            owner_id
          )
        `)
        .single();
        
      if (error) throw error;
      
      setEvents(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage };
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      // Validate update data (partial validation)
      const updateSchema = eventSchema.partial();
      const validationResult = updateSchema.safeParse(updates);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0].message;
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { data: null, error: errorMessage };
      }

      const { data, error } = await supabase
        .from('events')
        .update(validationResult.data as any)
        .eq('id', eventId)
        .select(`
          *,
          venues (
            id,
            name,
            address,
            owner_id
          )
        `)
        .single();
        
      if (error) throw error;
      
      setEvents(prev => prev.map(event => event.id === eventId ? data : event));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage };
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
      
      setEvents(prev => prev.filter(event => event.id !== eventId));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete event' };
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  return {
    events,
    loading,
    error,
    fetchAllEvents,
    fetchVenueEvents,
    fetchUserVenueEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};