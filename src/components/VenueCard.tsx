
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";
import { VenueRating } from "@/components/VenueRating";
import FavoriteButton from "@/components/FavoriteButton";

interface VenueCardProps {
  id?: string;
  name: string;
  image?: string;
  address: string;
  event?: string;
  genres: string[];
  attendees?: number;
  onClick?: () => void;
}

const VenueCard: React.FC<VenueCardProps> = ({
  id,
  name,
  image,
  address,
  event,
  genres,
  attendees,
  onClick
}) => {
  const defaultImage = "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1740&auto=format&fit=crop";
  
  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden" onClick={onClick}>
      <div className="relative">
        <img
          src={image || defaultImage}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {id && (
          <div className="absolute top-2 right-2">
            <FavoriteButton venueId={id} />
          </div>
        )}
        {event && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-primary/90 text-primary-foreground">
              {event}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{name}</h3>
          {id && <VenueRating venueId={id} size="sm" />}
        </div>
        
        <div className="flex items-center text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          {address}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {genres.map((genre, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
        
        {attendees && (
          <div className="flex items-center text-muted-foreground text-sm">
            <Users className="h-4 w-4 mr-1" />
            {attendees} attending
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VenueCard;
