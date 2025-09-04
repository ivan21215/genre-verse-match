
import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns";

const Events = () => {
  const { events, loading, error, fetchAllEvents } = useEvents();

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto pt-24 pb-12 px-4">
          <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
          <LoadingIndicator />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto pt-24 pb-12 px-4">
          <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="absolute inset-0 bg-gradient-venue"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                    <p className="text-white/80">{event.venues?.name}</p>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.event_date), "EEEE, MMMM d")}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>
                      {event.start_time}
                      {event.end_time && ` - ${event.end_time}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venues?.address}</span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Badge variant="secondary">
                        {event.genre}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.attendees || 0}
                        {event.max_attendees && ` / ${event.max_attendees}`} attending
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Events;
