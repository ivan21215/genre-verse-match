
import React, { useState } from "react";
import Header from "@/components/Header";
import GenreExplorer from "@/components/GenreExplorer";
import VenueCard from "@/components/VenueCard";
import MapView from "@/components/MapView";
import ProfileSetup from "@/components/ProfileSetup";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [selectedGenre, setSelectedGenre] = useState("");
  
  // Sample venue data
  const venues = [
    {
      id: 1,
      name: "Pulse Nightclub",
      image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1740&auto=format&fit=crop",
      address: "432 Market St, San Francisco",
      event: "Electric Friday",
      genres: ["Electronic", "Techno"],
      attendees: 124
    },
    {
      id: 2,
      name: "Jazz Central",
      image: "https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?q=80&w=1740&auto=format&fit=crop",
      address: "221 Pine Ave, San Francisco",
      event: "Smooth Jazz Night",
      genres: ["Jazz", "R&B"],
      attendees: 87
    },
    {
      id: 3,
      name: "The Bassment",
      image: "https://images.unsplash.com/photo-1520483691742-bada60a1edd6?q=80&w=1738&auto=format&fit=crop",
      address: "118 Howard St, San Francisco",
      event: "Hip Hop Thursdays",
      genres: ["Hip Hop", "R&B"],
      attendees: 156
    },
    {
      id: 4,
      name: "Vinyl Room",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1740&auto=format&fit=crop",
      address: "876 Valencia St, San Francisco",
      event: "Retro Rock Party",
      genres: ["Rock", "Pop"],
      attendees: 92
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 md:pt-32 md:pb-16 bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-full md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Find Your <span className="text-primary">Beat</span>,
                <br />
                Connect Your <span className="text-accent">Tribe</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover nightlife venues that match your music taste, connect with like-minded people, and create unforgettable memories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
                <Button size="lg" variant="outline">
                  For Venues
                </Button>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-genre-electronic animate-pulse-glow opacity-60"></div>
                <div className="absolute top-16 -right-8 w-24 h-24 rounded-full bg-genre-hiphop animate-pulse-glow opacity-50"></div>
                <div className="absolute -bottom-6 left-16 w-20 h-20 rounded-full bg-genre-pop animate-pulse-glow opacity-60"></div>
                <Card className="relative z-10 overflow-hidden shadow-2xl border-2 border-muted">
                  <CardContent className="p-0">
                    <img 
                      src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1740&auto=format&fit=crop" 
                      alt="Music event" 
                      className="w-full h-[350px] object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Genre Explorer */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <GenreExplorer onSelectGenre={setSelectedGenre} />
        </div>
      </section>
      
      {/* Popular Venues */}
      <section className="py-12 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Popular Venues</h2>
            <Button variant="ghost" className="text-primary">View All</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                name={venue.name}
                image={venue.image}
                address={venue.address}
                event={venue.event}
                genres={venue.genres}
                attendees={venue.attendees}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Find Venues Near You</h2>
          </div>
          <MapView />
        </div>
      </section>
      
      {/* Get Started Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Let's get started with your music profile</h2>
              <p className="text-muted-foreground">
                Create your profile to discover events and venues that match your music taste. Connect with Spotify to import your favorite genres automatically.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm">1</div>
                  <span>Select your favorite music genres</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm">2</div>
                  <span>Connect with Spotify to import your music taste</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm">3</div>
                  <span>Discover venues and events that match your preferences</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm">4</div>
                  <span>Connect with like-minded music enthusiasts</span>
                </li>
              </ul>
            </div>
            <div>
              <ProfileSetup />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
