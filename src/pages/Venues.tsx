import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVenues } from "@/hooks/useVenues";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VenueEventManager from "@/components/VenueEventManager";
import GenrePopularityStats from "@/components/GenrePopularityStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Settings, RefreshCw } from "lucide-react";

const Venues = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { venues, fetchVenues } = useVenues();
  const [subscriptionPlan, setSubscriptionPlan] = useState<"standard" | "premium">("standard");

  // Sample genre popularity data (in a real app, this would come from analytics)
  const genrePopularityData = [
    { genre: "Techno", count: 1240, trend: "up" as const },
    { genre: "Hip Hop", count: 980, trend: "up" as const },
    { genre: "Rock", count: 756, trend: "stable" as const },
    { genre: "Jazz", count: 543, trend: "down" as const },
    { genre: "Pop", count: 432, trend: "up" as const },
    { genre: "Cajke", count: 324, trend: "stable" as const },
  ];

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const userVenues = venues.filter(venue => venue.owner_id === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4 flex-grow">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile.name}!
              </h1>
              <p className="text-muted-foreground">
                Manage your {profile.business_type} and events from your dashboard.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={subscriptionPlan === "premium" ? "default" : "secondary"}>
                {subscriptionPlan === "premium" ? (
                  <><Crown className="w-4 h-4 mr-1" /> Premium</>
                ) : (
                  <><Star className="w-4 h-4 mr-1" /> Standard</>
                )}
              </Badge>
              <Button variant="outline" size="sm" onClick={fetchVenues}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Event Management
              </CardTitle>
              <CardDescription>
                Create and manage events for your {profile.business_type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VenueEventManager />
            </CardContent>
          </Card>

          {/* Genre Popularity Section */}
          <Card>
            <CardHeader>
              <CardTitle>Genre Popularity</CardTitle>
              <CardDescription>
                See what's trending in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenrePopularityStats data={genrePopularityData} />
            </CardContent>
          </Card>
        </div>

        {/* Your Venues Section */}
        {userVenues.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Venues</CardTitle>
              <CardDescription>
                Manage your registered venues and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {userVenues.map((venue) => (
                  <div key={venue.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{venue.name}</h3>
                        <p className="text-sm text-muted-foreground">{venue.address}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{venue.genre}</Badge>
                          <Badge variant="outline">{venue.type}</Badge>
                        </div>
                      </div>
                      <Badge variant={venue.subscription_plan === "premium" ? "default" : "secondary"}>
                        {venue.subscription_plan}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Venues;