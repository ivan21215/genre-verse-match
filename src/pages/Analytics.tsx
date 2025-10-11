import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useVenues } from "@/hooks/useVenues";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevenueAnalytics from "@/components/RevenueAnalytics";
import SpotifyGenreAnalytics from "@/components/SpotifyGenreAnalytics";
import RegionalAnalytics from "@/components/RegionalAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import { BarChart3, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { subDays, subMonths, startOfWeek, startOfMonth, startOfQuarter } from "date-fns";

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const { venues, loading: venuesLoading } = useVenues();
  const [selectedVenue, setSelectedVenue] = React.useState<string>("");
  const [dateRange, setDateRange] = React.useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const handleTimeRangeChange = (range: string) => {
    const now = new Date();
    switch (range) {
      case "week":
        setDateRange({ start: startOfWeek(now), end: now });
        break;
      case "month":
        setDateRange({ start: startOfMonth(now), end: now });
        break;
      case "quarter":
        setDateRange({ start: startOfQuarter(now), end: now });
        break;
      case "all":
      default:
        setDateRange({ start: null, end: null });
        break;
    }
  };

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

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                {userVenues.length > 1 && (
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Venue</label>
                    <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                      <SelectTrigger>
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
                  </div>
                )}
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Time Range</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTimeRangeChange("week")}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTimeRangeChange("month")}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTimeRangeChange("quarter")}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Quarter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTimeRangeChange("all")}
                      className="flex-1"
                    >
                      All Time
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <TabsTrigger value="regional">Regional Insights</TabsTrigger>
                <TabsTrigger value="spotify">Spotify Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revenue">
                <RevenueAnalytics 
                  venueId={selectedVenue || undefined}
                  startDate={dateRange.start || undefined}
                  endDate={dateRange.end || undefined}
                />
              </TabsContent>
              
              <TabsContent value="regional">
                <RegionalAnalytics 
                  venueId={selectedVenue || undefined}
                  startDate={dateRange.start || undefined}
                  endDate={dateRange.end || undefined}
                />
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