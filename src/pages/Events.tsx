
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Users, Loader2, Ticket, Megaphone } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useVenues } from "@/hooks/useVenues";
import { useAuth } from "@/contexts/AuthContext";
import RSVPButtons from "@/components/RSVPButtons";
import TicketManager from "@/components/TicketManager";
import EventPromotion from "@/components/EventPromotion";
import { Link } from "react-router-dom";

const Events = () => {
  const { user } = useAuth();
  const { events, loading: eventsLoading, fetchAllEvents } = useEvents();
  const { venues, loading: venuesLoading } = useVenues();
  const [selectedEventId, setSelectedEventId] = useState<string>("");

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

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;
  const userEvents = user ? events.filter(event => {
    const venue = getVenueInfo(event.venue_id);
    return venue?.owner_id === user.id;
  }) : [];

  const loading = eventsLoading || venuesLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Events & Management</h1>
            <Link to="/venues">
              <Button variant="outline">Manage Your Venues</Button>
            </Link>
          </div>

          {user ? (
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="events">
                  <Calendar className="w-4 h-4 mr-2" />
                  All Events
                </TabsTrigger>
                <TabsTrigger value="tickets">
                  <Ticket className="w-4 h-4 mr-2" />
                  Ticket Manager
                </TabsTrigger>
                <TabsTrigger value="promotion">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Event Promotion
                </TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="space-y-6">
                <h2 className="text-xl font-semibold">Upcoming Events</h2>
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
              </TabsContent>

              <TabsContent value="tickets" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Ticket Management</h2>
                    {userEvents.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="event-select">Select Event</Label>
                          <select
                            id="event-select"
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full mt-2 p-2 border rounded-md bg-background"
                          >
                            <option value="">Choose an event...</option>
                            {userEvents.map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.title} - {formatDate(event.event_date)}
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedEventId && <TicketManager eventId={selectedEventId} isOwner={true} />}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                          <p className="text-muted-foreground mb-4">
                            You need to create events first to manage tickets.
                          </p>
                          <Link to="/venues">
                            <Button>Create Your First Event</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="promotion" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Event Promotion</h2>
                    {userEvents.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="promo-event-select">Select Event</Label>
                          <select
                            id="promo-event-select"
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full mt-2 p-2 border rounded-md bg-background"
                          >
                            <option value="">Choose an event...</option>
                            {userEvents.map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.title} - {formatDate(event.event_date)}
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedEvent && <EventPromotion event={selectedEvent} />}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                          <p className="text-muted-foreground mb-4">
                            You need to create events first to promote them.
                          </p>
                          <Link to="/venues">
                            <Button>Create Your First Event</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to access event management features
              </p>
              <div className="space-y-4">
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
                <div>
                  <h3 className="text-lg font-medium mb-4">Public Events</h3>
                  {loading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.slice(0, 6).map((event) => {
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
                              
                              <Badge variant="secondary">{event.genre}</Badge>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No events available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
