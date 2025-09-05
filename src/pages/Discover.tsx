import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GenreExplorer from "@/components/GenreExplorer";
import { SearchFilters, SearchFilters as SearchFiltersType } from "@/components/SearchFilters";
import { useVenues } from "@/hooks/useVenues";
import { VenueRating } from "@/components/VenueRating";
import { ReviewsList } from "@/components/ReviewsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Star, Users, Clock } from "lucide-react";
import LoadingIndicator from "@/components/LoadingIndicator";

const Discover = () => {
  const [filters, setFilters] = useState<SearchFiltersType>({
    searchTerm: '',
    genre: 'All Genres',
    venueType: 'All Types',
    minRating: 0,
    location: '',
    maxDistance: 50
  });

  const { venues, loading, error } = useVenues();

  const filteredVenues = useMemo(() => {
    let filtered = venues;

    // Search term filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(venue => 
        venue.name.toLowerCase().includes(searchTerm) ||
        venue.address.toLowerCase().includes(searchTerm) ||
        venue.genre.toLowerCase().includes(searchTerm)
      );
    }

    // Genre filter
    if (filters.genre !== 'All Genres') {
      filtered = filtered.filter(venue => venue.genre === filters.genre);
    }

    // Venue type filter
    if (filters.venueType !== 'All Types') {
      filtered = filtered.filter(venue => venue.type === filters.venueType);
    }

    // Location filter (basic text matching)
    if (filters.location) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(venue => 
        venue.address.toLowerCase().includes(location)
      );
    }

    return filtered;
  }, [venues, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Music Venues</h1>
          <p className="text-muted-foreground">
            Find the perfect venue for your musical taste
          </p>
        </div>
        
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          className="mb-8"
        />

        <div className="grid gap-6">
          {/* Venue Results */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              {filteredVenues.length} venues found
            </h2>
            
            {loading ? (
              <LoadingIndicator />
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Error loading venues: {error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue) => (
                  <Card key={venue.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {venue.genre}
                        </Badge>
                        <VenueRating venueId={venue.id} size="sm" />
                      </div>
                      <CardTitle className="text-lg">{venue.name}</CardTitle>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{venue.address}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">
                          {venue.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {venue.distance}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Star className="w-4 h-4 mr-2" />
                              Reviews
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{venue.name} - Reviews</DialogTitle>
                            </DialogHeader>
                            <ReviewsList venueId={venue.id} />
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm" className="flex-1">
                          <MapPin className="w-4 h-4 mr-2" />
                          Navigate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Genre Explorer */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Explore by Genre</h2>
            <GenreExplorer />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Discover;