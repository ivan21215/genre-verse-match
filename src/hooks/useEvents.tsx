import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
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
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create event' };
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
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
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update event' };
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