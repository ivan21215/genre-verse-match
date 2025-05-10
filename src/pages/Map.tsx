
import React, { useState } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Disc, Headphones, Radio, Mic, Guitar } from "lucide-react";

const Map = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [venueType, setVenueType] = useState<"All" | "Venue" | "Club">("All");

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleTypeChange = (type: "All" | "Venue" | "Club") => {
    setVenueType(type);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-4">Find Venues & Clubs Near You</h1>
        
        <div className="mb-4">
          <Tabs defaultValue="All" onValueChange={(v) => handleTypeChange(v as "All" | "Venue" | "Club")}>
            <TabsList className="mb-4">
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Venue">Venues</TabsTrigger>
              <TabsTrigger value="Club">Clubs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-6 overflow-x-auto pb-2">
          <ToggleGroup type="single" value={selectedGenre} onValueChange={(value) => value && handleGenreChange(value)} className="flex space-x-2">
            <ToggleGroupItem value="All" className="whitespace-nowrap">All Genres</ToggleGroupItem>
            <ToggleGroupItem value="Cajke" className="whitespace-nowrap bg-genre-cajke data-[state=on]:bg-genre-cajke/70"><Music className="mr-1" /> Cajke</ToggleGroupItem>
            <ToggleGroupItem value="Trash" className="whitespace-nowrap bg-genre-trash data-[state=on]:bg-genre-trash/70"><Disc className="mr-1" /> Trash</ToggleGroupItem>
            <ToggleGroupItem value="Techno" className="whitespace-nowrap bg-genre-techno data-[state=on]:bg-genre-techno/70"><Headphones className="mr-1" /> Techno</ToggleGroupItem>
            <ToggleGroupItem value="White Girl Music" className="whitespace-nowrap bg-genre-pop data-[state=on]:bg-genre-pop/70"><Music className="mr-1" /> White Girl Music</ToggleGroupItem>
            <ToggleGroupItem value="Hip Hop" className="whitespace-nowrap bg-genre-hiphop data-[state=on]:bg-genre-hiphop/70"><Headphones className="mr-1" /> Hip Hop</ToggleGroupItem>
            <ToggleGroupItem value="Rock" className="whitespace-nowrap bg-genre-rock data-[state=on]:bg-genre-rock/70"><Guitar className="mr-1" /> Rock</ToggleGroupItem>
            <ToggleGroupItem value="Rap" className="whitespace-nowrap bg-orange-500 data-[state=on]:bg-orange-500/70"><Mic className="mr-1" /> Rap</ToggleGroupItem>
            <ToggleGroupItem value="Dance" className="whitespace-nowrap bg-pink-500 data-[state=on]:bg-pink-500/70"><Music className="mr-1" /> Dance</ToggleGroupItem>
            <ToggleGroupItem value="Jazz" className="whitespace-nowrap bg-amber-500 data-[state=on]:bg-amber-500/70"><Radio className="mr-1" /> Jazz</ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="h-[600px] md:h-[700px] relative rounded-xl overflow-hidden">
          <MapView selectedGenre={selectedGenre} venueType={venueType} />
        </div>
      </div>
    </div>
  );
};

export default Map;
