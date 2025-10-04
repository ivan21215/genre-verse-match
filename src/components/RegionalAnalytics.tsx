import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRegionalAnalytics } from '@/hooks/useRegionalAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { MapPin, Star, Users, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegionalAnalyticsProps {
  venueId?: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a48dd1'];

const RegionalAnalytics: React.FC<RegionalAnalyticsProps> = ({ venueId }) => {
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const {
    loading,
    reviewsByRegion,
    rsvpsByRegion,
    venueLocation,
    fetchRegionalAnalytics
  } = useRegionalAnalytics(venueId, maxDistance);

  React.useEffect(() => {
    fetchRegionalAnalytics(venueId);
  }, [venueId, maxDistance]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!venueLocation) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Venue location not set. Please add coordinates to your venue to see regional analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalReviews = reviewsByRegion.reduce((sum, r) => sum + r.count, 0);
  const totalRSVPs = rsvpsByRegion.reduce((sum, r) => sum + r.count, 0);
  const avgRating = reviewsByRegion.reduce((sum, r) => sum + (r.avgRating * r.count), 0) / (totalReviews || 1);

  return (
    <div className="space-y-6">
      {/* Header with Distance Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Regional Analytics
              </CardTitle>
              <CardDescription>
                Data from users within {maxDistance}km of your venue
              </CardDescription>
            </div>
            <Select 
              value={maxDistance.toString()} 
              onValueChange={(val) => setMaxDistance(Number(val))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 km radius</SelectItem>
                <SelectItem value="50">50 km radius</SelectItem>
                <SelectItem value="100">100 km radius</SelectItem>
                <SelectItem value="200">200 km radius</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews (Local)</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {avgRating.toFixed(1)} ⭐
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RSVPs (Local)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRSVPs}</div>
            <p className="text-xs text-muted-foreground">
              From {rsvpsByRegion.length} regions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewsByRegion.length}</div>
            <p className="text-xs text-muted-foreground">
              With feedback data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews by Region Chart */}
      {reviewsByRegion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reviews by Region</CardTitle>
            <CardDescription>Number of reviews and average ratings per region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reviewsByRegion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" name="Review Count" />
                <Bar yAxisId="right" dataKey="avgRating" fill="hsl(var(--secondary))" name="Avg Rating" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* RSVPs by Region Chart */}
      {rsvpsByRegion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>RSVPs by Region</CardTitle>
            <CardDescription>Event interest breakdown by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rsvpsByRegion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="goingCount" stackId="a" fill="hsl(var(--primary))" name="Going" />
                <Bar dataKey="interestedCount" stackId="a" fill="hsl(var(--secondary))" name="Interested" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Regional Distribution Pie Chart */}
      {reviewsByRegion.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Distribution</CardTitle>
              <CardDescription>Share of reviews by region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={reviewsByRegion}
                    dataKey="count"
                    nameKey="city"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.city} (${entry.count})`}
                  >
                    {reviewsByRegion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>RSVP Distribution</CardTitle>
              <CardDescription>Share of RSVPs by region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={rsvpsByRegion}
                    dataKey="count"
                    nameKey="city"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.city} (${entry.count})`}
                  >
                    {rsvpsByRegion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Regional Details Table */}
      {reviewsByRegion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Regional Breakdown</CardTitle>
            <CardDescription>Detailed statistics by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Region/City</th>
                    <th className="text-right p-2">Distance</th>
                    <th className="text-right p-2">Reviews</th>
                    <th className="text-right p-2">Avg Rating</th>
                    <th className="text-right p-2">RSVPs</th>
                    <th className="text-right p-2">Going</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewsByRegion.map((review, idx) => {
                    const rsvp = rsvpsByRegion.find(r => r.region === review.region);
                    return (
                      <tr key={review.region} className="border-b">
                        <td className="p-2 font-medium">{review.city}</td>
                        <td className="text-right p-2 text-muted-foreground">{review.distance} km</td>
                        <td className="text-right p-2">{review.count}</td>
                        <td className="text-right p-2">{review.avgRating.toFixed(1)} ⭐</td>
                        <td className="text-right p-2">{rsvp?.count || 0}</td>
                        <td className="text-right p-2">{rsvp?.goingCount || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {reviewsByRegion.length === 0 && rsvpsByRegion.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              No regional data available yet within {maxDistance}km radius.
            </p>
            <p className="text-sm text-muted-foreground">
              Reviews and RSVPs with location data will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegionalAnalytics;
