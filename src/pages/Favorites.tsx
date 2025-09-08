import React from "react";
import Header from "@/components/Header";
import VenueCard from "@/components/VenueCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useVenues } from "@/hooks/useVenues";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Favorites = () => {
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { venues, loading: venuesLoading } = useVenues();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center space-y-4">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-bold">Sign in to view favorites</h1>
            <p className="text-muted-foreground">
              Create an account to bookmark your favorite venues and clubs
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const favoriteVenues = venues.filter(venue => 
    favorites.some(fav => fav.venue_id === venue.id)
  );

  const loading = favoritesLoading || venuesLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold">Your Favorite Venues</h1>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : favoriteVenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  id={venue.id}
                  name={venue.name}
                  image={venue.image_url}
                  address={venue.address || "Address not available"}
                  genres={[venue.genre]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6">
                Start exploring venues and add them to your favorites by clicking the heart icon
              </p>
              <Link to="/discover">
                <Button>Discover Venues</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;