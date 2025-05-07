
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GenreExplorer from "@/components/GenreExplorer";
import VenueCard from "@/components/VenueCard";

const Discover = () => {
  // Sample venue data
  const venues = [
    {
      id: 1,
      name: "Pulse Nightclub",
      image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1740&auto=format&fit=crop",
      address: "432 Market St, Zagreb",
      event: "Electric Friday",
      genres: ["Electronic", "Techno"],
      attendees: 124
    },
    {
      id: 2,
      name: "Jazz Central",
      image: "https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?q=80&w=1740&auto=format&fit=crop",
      address: "221 Pine Ave, Zagreb",
      event: "Smooth Jazz Night",
      genres: ["Jazz", "R&B"],
      attendees: 87
    },
    {
      id: 3,
      name: "Club Cajke",
      image: "https://images.unsplash.com/photo-1520483691742-bada60a1edd6?q=80&w=1738&auto=format&fit=crop",
      address: "118 Howard St, Zagreb",
      event: "Cajke Party",
      genres: ["Cajke"],
      attendees: 156
    },
    {
      id: 4,
      name: "Trash Palace",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1740&auto=format&fit=crop",
      address: "876 Valencia St, Zagreb",
      event: "Trash Night",
      genres: ["Trash", "Pop"],
      attendees: 92
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Discover Venues</h1>
        
        <GenreExplorer />
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Popular Venues</h2>
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
      </div>
      
      <Footer />
    </div>
  );
};

export default Discover;
