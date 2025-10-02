import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useVenues } from "@/hooks/useVenues";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevenueAnalytics from "@/components/RevenueAnalytics";
import SpotifyGenreAnalytics from "@/components/SpotifyGenreAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigate } from "react-router-dom";
import { BarChart3, DollarSign, TrendingUp } from "lucide-react";

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const { venues, loading: venuesLoading } = useVenues();
  const [selectedVenue, setSelectedVenue] = React.useState<string>("");

  if (authLoading || venuesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userVenues = venues.filter(venue => venue.owner_id === user.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Track venue performance, ticket sales, and Spotify trends
              </p>
            </div>
          </div>

          {/* Venue Filter */}
          {userVenues.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Filter by Venue</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="All venues" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All venues</SelectItem>
                    {userVenues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {userVenues.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Venues Found</h3>
                <p className="text-muted-foreground mb-4">
                  You need to create a venue first to see revenue analytics data.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="revenue" className="space-y-6">
              <TabsList>
                <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
                <TabsTrigger value="spotify">Spotify Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revenue">
                <RevenueAnalytics venueId={selectedVenue || undefined} />
              </TabsContent>
              
              <TabsContent value="spotify">
                <SpotifyGenreAnalytics />
              </TabsContent>
            </Tabs>
          )}

          {/* Tips Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Boost Revenue</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Create premium ticket tiers</li>
                    <li>• Offer early bird discounts</li>
                    <li>• Use event promotion tools</li>
                    <li>• Optimize event timing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Track Performance</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Monitor ticket sales trends</li>
                    <li>• Compare venue performance</li>
                    <li>• Analyze seasonal patterns</li>
                    <li>• Set revenue goals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analytics;