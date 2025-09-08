
import React, { useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Loader2 } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useVenues } from "@/hooks/useVenues";
import RSVPButtons from "@/components/RSVPButtons";
import { Link } from "react-router-dom";

const Events = () => {
  const { events, loading: eventsLoading, fetchAllEvents } = useEvents();
  const { venues, loading: venuesLoading } = useVenues();

  useEffect(() => {
    fetchAllEvents();
  }, []);

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

  const getVenueInfo = (venueId: string) => {
    return venues.find(venue => venue.id === venueId);
  };

  const loading = eventsLoading || venuesLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Upcoming Events</h1>
            <Link to="/venues">
              <Button variant="outline">Manage Your Events</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const venue = getVenueInfo(event.venue_id);
                
                return (
                  <Card key={event.id} className="w-full">
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
                      <div className="absolute inset-0 bg-gradient-venue"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white">{event.title}</h3>
                        <p className="text-white/80">{venue?.name}</p>
                      </div>
                    </div>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.event_date)}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>
                          {formatTime(event.start_time)}
                          {event.end_time && ` - ${formatTime(event.end_time)}`}
                        </span>
                      </div>
                      
                      {venue && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{venue.name}</span>
                        </div>
                      )}
                      
                      {event.max_attendees && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Capacity: {event.attendees || 0} / {event.max_attendees}</span>
                        </div>
                      )}
                      
                      <Badge variant="secondary">{event.genre}</Badge>
                      
                      <RSVPButtons eventId={event.id} showCounts={true} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No upcoming events</h2>
              <p className="text-muted-foreground mb-6">
                Be the first to create an event for your venue
              </p>
              <Link to="/venues">
                <Button>Create Event</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
