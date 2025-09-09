import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  stripe_price_id?: string;
}

export interface Subscription {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>({ subscribed: false });
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) throw error;
      
      const transformedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        features: Array.isArray(plan.features) ? plan.features.map(f => String(f)) : [],
        stripe_price_id: plan.stripe_price_id
      }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({ subscribed: false });
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (planName: string) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planName }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create checkout session' };
    }
  };

  const openCustomerPortal = async () => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open Stripe customer portal in a new tab
      window.open(data.url, '_blank');
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to open customer portal' };
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setSubscription({ subscribed: false });
      setLoading(false);
    }
  }, [user]);

  return {
    subscription,
    plans,
    loading,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal
  };
};