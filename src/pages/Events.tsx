
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

const Events = () => {
  const events = [
    {
      id: 1,
      name: "Cajke Friday",
      venue: "Club Cajke",
      image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1740&auto=format&fit=crop",
      address: "432 Market St, Zagreb",
      date: "Friday, May 10",
      time: "22:00 - 04:00",
      genres: ["Cajke"],
      attendees: 124
    },
    {
      id: 2,
      name: "Trash Thursday",
      venue: "Trash Palace",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1740&auto=format&fit=crop",
      address: "876 Valencia St, Zagreb",
      date: "Thursday, May 9",
      time: "23:00 - 05:00",
      genres: ["Trash", "Pop"],
      attendees: 92
    },
    {
      id: 3,
      name: "Techno Tuesday",
      venue: "Pulse Nightclub",
      image: "https://images.unsplash.com/photo-1520483691742-bada60a1edd6?q=80&w=1738&auto=format&fit=crop",
      address: "118 Howard St, Zagreb",
      date: "Tuesday, May 14",
      time: "22:00 - 03:00",
      genres: ["Electronic", "Techno"],
      attendees: 156
    },
    {
      id: 4,
      name: "Jazz & Chill",
      venue: "Jazz Central",
      image: "https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?q=80&w=1740&auto=format&fit=crop",
      address: "221 Pine Ave, Zagreb",
      date: "Sunday, May 12",
      time: "20:00 - 01:00",
      genres: ["Jazz", "R&B"],
      attendees: 87
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={event.image} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-venue"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">{event.name}</h3>
                  <p className="text-white/80">{event.venue}</p>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{event.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {event.genres.map((genre) => (
                      <Badge 
                        key={genre} 
                        className={`bg-genre-${genre.toLowerCase()}`}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.attendees} attending
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Events;
