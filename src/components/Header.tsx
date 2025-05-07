
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, User, Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-primary text-2xl font-bold">
            Vibe<span className="text-accent">Verse</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="text-foreground hover:text-primary">Discover</Button>
          <Button variant="ghost" className="text-foreground hover:text-primary">Events</Button>
          <Button variant="ghost" className="text-foreground hover:text-primary">Map</Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search venues, genres..." 
              className="pl-10 pr-4 py-2 rounded-full bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-[200px]"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border p-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Discover</Button>
            <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Events</Button>
            <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Map</Button>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search venues, genres..." 
                className="pl-10 pr-4 py-2 rounded-full bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
              />
            </div>
            <Button variant="outline" className="mt-2">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
