import React, { useState } from 'react';
import { CreditCard, Check, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
  stripePriceId?: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'List up to 5 venues',
      'Basic event management',
      'Email support',
      'Standard visibility'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    popular: true,
    features: [
      'List up to 20 venues',
      'Advanced event management',
      'Priority support',
      'Enhanced visibility',
      'Analytics dashboard',
      'Custom branding'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited venues',
      'Full event management suite',
      '24/7 dedicated support',
      'Maximum visibility',
      'Advanced analytics',
      'White-label options',
      'API access',
      'Custom integrations'
    ]
  }
];

interface StripePaymentsProps {
  currentPlan?: string;
  onPlanChange?: (planId: string) => void;
}

export const StripePayments: React.FC<StripePaymentsProps> = ({
  currentPlan,
  onPlanChange
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(plan.id);
    
    try {
      toast({
        title: "Stripe Integration Required",
        description: "Stripe payment integration needs to be configured with your secret keys.",
        variant: "destructive",
      });
      
      // This is where you would integrate with your Stripe edge function
      // Example:
      // const { data, error } = await supabase.functions.invoke('create-checkout', {
      //   body: { planId: plan.id, priceId: plan.stripePriceId }
      // });
      // 
      // if (error) throw error;
      // 
      // if (data.url) {
      //   window.open(data.url, '_blank');
      // }
      
    } catch (error) {
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the perfect plan for your venue business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.id || currentPlan === plan.id}
              >
                {loading === plan.id ? (
                  "Processing..."
                ) : currentPlan === plan.id ? (
                  "Current Plan"
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscribe to {plan.name}
                  </>
                )}
              </Button>

              {currentPlan === plan.id && (
                <p className="text-center text-sm text-muted-foreground">
                  You are currently on this plan
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Need Help Choosing?</h3>
            <p className="text-muted-foreground mb-4">
              Contact our sales team for personalized recommendations
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Contact Sales</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contact Sales</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Get in touch with our sales team for:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Custom enterprise solutions</li>
                    <li>Volume discounts</li>
                    <li>Integration support</li>
                    <li>Personalized demos</li>
                  </ul>
                  <div className="text-center">
                    <p className="font-medium">sales@genreversematch.com</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};