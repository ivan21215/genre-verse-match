import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import RSVPButtons from "@/components/RSVPButtons";

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  venue_id: string;
  genre: string;
  max_attendees?: number;
  attendees?: number;
  venue?: {
    name: string;
    address: string;
  };
}

interface EventRSVPProps {
  event: Event;
}

const EventRSVP: React.FC<EventRSVPProps> = ({ event }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{event.title}</CardTitle>
          <Badge variant="secondary">{event.genre}</Badge>
        </div>
        {event.description && (
          <p className="text-muted-foreground">{event.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.event_date)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(event.start_time)}
            {event.end_time && ` - ${formatTime(event.end_time)}`}
          </span>
        </div>
        
        {event.venue && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.venue.name}, {event.venue.address}</span>
          </div>
        )}
        
        {event.max_attendees && (
          <div className="text-sm text-muted-foreground">
            Capacity: {event.attendees || 0} / {event.max_attendees} attendees
          </div>
        )}
        
        <RSVPButtons eventId={event.id} showCounts={true} />
      </CardContent>
    </Card>
  );
};

export default EventRSVP;