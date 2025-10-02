
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, User, Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-primary text-2xl font-bold">
            Vibe<span className="text-accent">Verse</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/discover">
            <Button variant="ghost" className="text-foreground hover:text-primary">Discover</Button>
          </Link>
          <Link to="/events">
            <Button variant="ghost" className="text-foreground hover:text-primary">Events</Button>
          </Link>
          <Link to="/map">
            <Button variant="ghost" className="text-foreground hover:text-primary">Map</Button>
          </Link>
          <Link to="/subscriptions">
            <Button variant="ghost" className="text-foreground hover:text-primary">Subscriptions</Button>
          </Link>
          {user && (
            <>
              <Link to="/find-matches">
                <Button variant="ghost" className="text-foreground hover:text-primary">Find Matches</Button>
              </Link>
              {profile?.business_type !== 'user' && (
                <>
                  <Link to="/venues">
                    <Button variant="ghost" className="text-foreground hover:text-primary">Venues</Button>
                  </Link>
                  <Link to="/analytics">
                    <Button variant="ghost" className="text-foreground hover:text-primary">Analytics</Button>
                  </Link>
                </>
              )}
              <Link to="/favorites">
                <Button variant="ghost" className="text-foreground hover:text-primary">Favorites</Button>
              </Link>
            </>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search venues, genres..." 
              className="pl-10 pr-4 py-2 rounded-full bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-[200px]"
            />
          </div>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="default">Login</Button>
            </Link>
          )}
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
            <Link to="/discover" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Discover</Button>
            </Link>
            <Link to="/events" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Events</Button>
            </Link>
            <Link to="/map" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Map</Button>
            </Link>
            <Link to="/subscriptions" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Subscriptions</Button>
            </Link>
            {user && (
              <>
                <Link to="/find-matches" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Find Matches</Button>
                </Link>
                {profile?.business_type !== 'user' && (
                  <>
                    <Link to="/venues" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Venues</Button>
                    </Link>
                    <Link to="/analytics" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Analytics</Button>
                    </Link>
                  </>
                )}
                <Link to="/favorites" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">Favorites</Button>
                </Link>
              </>
            )}
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search venues, genres..." 
                className="pl-10 pr-4 py-2 rounded-full bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
              />
            </div>
            
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="mt-2">
                    <User className="h-4 w-4 mr-2" />
                    Profile ({profile?.name})
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleSignOut} className="mt-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button variant="default" className="mt-2">Login</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
