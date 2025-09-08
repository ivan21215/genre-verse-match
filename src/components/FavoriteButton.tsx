import React from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";

interface FavoriteButtonProps {
  venueId: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  venueId, 
  size = "sm", 
  variant = "ghost" 
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { user } = useAuth();

  const handleToggleFavorite = () => {
    if (!user) return;
    
    if (isFavorite(venueId)) {
      removeFromFavorites(venueId);
    } else {
      addToFavorites(venueId);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleToggleFavorite}
      className="transition-colors"
    >
      <Heart 
        className={`h-4 w-4 ${isFavorite(venueId) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
      />
    </Button>
  );
};

export default FavoriteButton;