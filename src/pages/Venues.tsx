
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VenueSubscriptionForm from "@/components/VenueSubscriptionForm";
import VenueEventManager from "@/components/VenueEventManager";
import GenrePopularityStats from "@/components/GenrePopularityStats";

const Venues = () => {
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [venueLoggedIn, setVenueLoggedIn] = useState(false);
  const [venueCode, setVenueCode] = useState("");
  
  // Sample genre popularity data
  const genrePopularityData = [
    { genre: "Techno", count: 342, trend: "up" },
    { genre: "Hip Hop", count: 289, trend: "up" },
    { genre: "Rock", count: 187, trend: "down" },
    { genre: "Cajke", count: 256, trend: "up" },
    { genre: "Trash", count: 201, trend: "stable" },
    { genre: "White Girl Music", count: 312, trend: "up" },
    { genre: "Dance", count: 178, trend: "down" },
    { genre: "Jazz", count: 98, trend: "stable" },
    { genre: "Rap", count: 276, trend: "up" },
  ];

  const handleLogin = () => {
    if (venueCode.trim() !== "") {
      setVenueLoggedIn(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">For Venues</h1>
        
        {!venueLoggedIn ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Venue Login</CardTitle>
                <CardDescription>
                  Enter your venue code to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Input 
                      placeholder="Enter your venue code" 
                      value={venueCode}
                      onChange={(e) => setVenueCode(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleLogin} className="w-full">Login</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Join the Network</CardTitle>
                <CardDescription>
                  List your venue and reach more customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm">✓</div>
                      <span>Reach more customers interested in your genre</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm">✓</div>
                      <span>Promote your events to targeted audience</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm">✓</div>
                      <span>Get insights on trending music genres</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm">✓</div>
                      <span>Simple monthly subscription</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setShowSubscriptionForm(true)}
                  className="w-full"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe Now
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Club Venue Dashboard</h2>
                <p className="text-muted-foreground">Manage your events and see genre analytics</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">Subscription Active</Badge>
                <Button variant="outline" size="sm">Manage Subscription</Button>
                <Button variant="ghost" size="sm" onClick={() => setVenueLoggedIn(false)}>Logout</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Event Manager
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VenueEventManager />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Genre Popularity</CardTitle>
                  <CardDescription>Weekly trends based on user preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <GenrePopularityStats data={genrePopularityData} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {showSubscriptionForm && (
          <VenueSubscriptionForm onClose={() => setShowSubscriptionForm(false)} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Venues;
