import React, { useState } from 'react';
import { CreditCard, Check, Star, RefreshCw, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';


export const StripePayments: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    subscription,
    plans,
    loading,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal
  } = useSubscription();

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await createCheckoutSession(planName);
      
      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Redirecting to Checkout",
        description: "Opening Stripe checkout in a new tab...",
      });
    } catch (error) {
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { error } = await openCustomerPortal();
      
      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Opening Customer Portal",
        description: "Redirecting to subscription management...",
      });
    } catch (error) {
      toast({
        title: "Portal Error",
        description: error instanceof Error ? error.message : "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    try {
      await checkSubscription();
      toast({
        title: "Subscription Refreshed",
        description: "Your subscription status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh subscription status.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Loading Subscription Plans</h2>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            Select the perfect plan for your venue business
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshSubscription}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {subscription.subscribed && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Subscription</span>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Plan: <strong>{subscription.subscription_tier}</strong></span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>
            {subscription.subscription_end && (
              <p className="text-sm text-muted-foreground">
                Next billing: {new Date(subscription.subscription_end).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = subscription.subscription_tier === plan.name;
          const isPopular = plan.name === 'Premium';
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${isPopular ? 'border-primary ring-2 ring-primary/20' : ''} ${isCurrentPlan ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}
            >
              {isPopular && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    Your Plan
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {formatPrice(plan.price / 100, plan.currency)}
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
                  variant={isCurrentPlan ? "secondary" : isPopular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? (
                    "Current Plan"
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Subscribe to {plan.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
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