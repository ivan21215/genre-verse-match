import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsMetric {
  id: string;
  venue_id: string;
  metric_type: string;
  metric_value: number;
  date: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  tickets_sold: number;
  events: number;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

  const fetchVenueAnalytics = async (venueId?: string, startDate?: Date, endDate?: Date) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch revenue data from ticket purchases
      let query = supabase
        .from('ticket_purchases')
        .select(`
          created_at,
          total_amount,
          quantity,
          status,
          events!inner(
            venue_id,
            venues!inner(owner_id)
          )
        `)
        .eq('events.venues.owner_id', user.id)
        .eq('status', 'paid');

      if (venueId) {
        query = query.eq('events.venue_id', venueId);
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data: purchases, error: purchasesError } = await query;
      
      if (purchasesError) throw purchasesError;

      // Process revenue data by date
      const revenueByDate: { [key: string]: RevenueData } = {};
      let totalRev = 0;
      let totalTickets = 0;

      (purchases || []).forEach(purchase => {
        const date = new Date(purchase.created_at).toISOString().split('T')[0];
        const revenue = purchase.total_amount / 100; // Convert from cents
        
        if (!revenueByDate[date]) {
          revenueByDate[date] = {
            date,
            revenue: 0,
            tickets_sold: 0,
            events: 0
          };
        }
        
        revenueByDate[date].revenue += revenue;
        revenueByDate[date].tickets_sold += purchase.quantity;
        totalRev += revenue;
        totalTickets += purchase.quantity;
      });

      // Fetch total events count
      let eventsQuery = supabase
        .from('events')
        .select('id, venues!inner(owner_id)')
        .eq('venues.owner_id', user.id);

      if (venueId) {
        eventsQuery = eventsQuery.eq('venue_id', venueId);
      }

      const { data: events, error: eventsError } = await eventsQuery;
      
      if (eventsError) throw eventsError;

      const revenueArray = Object.values(revenueByDate).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setRevenueData(revenueArray);
      setTotalRevenue(totalRev);
      setTotalTicketsSold(totalTickets);
      setTotalEvents(events?.length || 0);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackVenueView = async (venueId: string) => {
    try {
      await supabase
        .from('venue_analytics')
        .insert([{
          venue_id: venueId,
          metric_type: 'views',
          metric_value: 1
        }]);
    } catch (error) {
      console.error('Error tracking venue view:', error);
    }
  };

  const trackEventBooking = async (venueId: string) => {
    try {
      await supabase
        .from('venue_analytics')
        .insert([{
          venue_id: venueId,
          metric_type: 'bookings',
          metric_value: 1
        }]);
    } catch (error) {
      console.error('Error tracking event booking:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVenueAnalytics();
    }
  }, [user]);

  return {
    loading,
    revenueData,
    totalRevenue,
    totalTicketsSold,
    totalEvents,
    fetchVenueAnalytics,
    trackVenueView,
    trackEventBooking
  };
};