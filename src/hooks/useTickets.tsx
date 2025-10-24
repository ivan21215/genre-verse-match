import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const ticketSchema = z.object({
  event_id: z.string().uuid('Invalid event ID'),
  ticket_type: z.string().trim().min(1, 'Ticket type is required').max(100, 'Ticket type must be less than 100 characters'),
  price: z.number().int('Price must be an integer').min(0, 'Price must be non-negative').max(1000000, 'Price exceeds maximum'),
  quantity_available: z.number().int('Quantity must be an integer').min(0, 'Quantity must be non-negative').max(100000, 'Quantity exceeds maximum').optional(),
});

export interface EventTicket {
  id: string;
  event_id: string;
  ticket_type: string;
  price: number;
  quantity_available?: number;
  quantity_sold: number;
  stripe_price_id?: string;
}

export interface TicketPurchase {
  id: string;
  event_id: string;
  ticket_id: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export const useTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [purchases, setPurchases] = useState<TicketPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEventTickets = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId);
      
      if (error) throw error;
      
      setTickets(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching event tickets:', error);
      return [];
    }
  };

  const fetchUserPurchases = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_purchases')
        .select(`
          *,
          events(title, event_date),
          event_tickets(ticket_type, price)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching user purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: {
    event_id: string;
    ticket_type: string;
    price: number;
    quantity_available?: number;
  }) => {
    try {
      // Validate input data
      const validation = ticketSchema.safeParse(ticketData);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0].message;
        return { data: null, error: errorMessage };
      }

      const { data, error } = await supabase
        .from('event_tickets')
        .insert([validation.data])
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create ticket' };
    }
  };

  const purchaseTicket = async (ticketId: string, quantity: number = 1) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const { data, error } = await supabase.functions.invoke('purchase-ticket', {
        body: { ticket_id: ticketId, quantity }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to purchase ticket' };
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<EventTicket>) => {
    try {
      const { data, error } = await supabase
        .from('event_tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update ticket' };
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPurchases();
    }
  }, [user]);

  return {
    tickets,
    purchases,
    loading,
    fetchEventTickets,
    fetchUserPurchases,
    createTicket,
    purchaseTicket,
    updateTicket
  };
};