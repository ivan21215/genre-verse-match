
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Calendar, CreditCard, Lock, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VenueSubscriptionForm from "@/components/VenueSubscriptionForm";
import VenueEventManager from "@/components/VenueEventManager";
import GenrePopularityStats from "@/components/GenrePopularityStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Venues = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [venueLoggedIn, setVenueLoggedIn] = useState(false);
  const [venueCode, setVenueCode] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState<"standard" | "premium">("standard");
  const [businessType, setBusinessType] = useState<"venue" | "club">("venue");
  const [userData, setUserData] = useState<any>(null);
  
  // Check if user is already logged in on component mount
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserData(user);
      setBusinessType(user.businessType);
      setVenueLoggedIn(true);
      
      // For demo purposes - set premium plan if the venue/club name contains "Premium"
      if (user.name.toLowerCase().includes("premium")) {
        setSubscriptionPlan("premium");
      }
    }
  }, []);
  
  // Sample genre popularity data with correctly typed trends
  const genrePopularityData = [
    { genre: "Techno", count: 342, trend: "up" as const },
    { genre: "Hip Hop", count: 289, trend: "up" as const },
    { genre: "Rock", count: 187, trend: "down" as const },
    { genre: "Cajke", count: 256, trend: "up" as const },
    { genre: "Trash", count: 201, trend: "stable" as const },
    { genre: "White Girl Music", count: 312, trend: "up" as const },
    { genre: "Dance", count: 178, trend: "down" as const },
    { genre: "Jazz", count: 98, trend: "stable" as const },
    { genre: "Rap", count: 276, trend: "up" as const },
  ];

  const handleLogin = () => {
    if (venueCode.trim() !== "") {
      setVenueLoggedIn(true);
      
      // Determine subscription plan from venue code (in a real app, this would be validated server-side)
      // For this example, we'll assume codes containing "PRE" are premium
      if (venueCode.includes("PRE")) {
        setSubscriptionPlan("premium");
      } else {
        setSubscriptionPlan("standard");
      }
    }
  };

  const handleUpgrade = () => {
    setShowSubscriptionForm(true);
    setBusinessType(businessType); // keep the current business type
  };
  
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setVenueLoggedIn(false);
    setUserData(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };
  
  const goToAuth = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">For Venues & Clubs</h1>
        
        {!venueLoggedIn ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Venue/Club Login</CardTitle>
                <CardDescription>
                  Enter your code to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Input 
                      placeholder="Enter your venue/club code" 
                      value={venueCode}
                      onChange={(e) => setVenueCode(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleLogin} className="w-full">Login with Code</Button>
                  <div className="text-center">
                    <span className="text-sm text-muted-foreground">Or</span>
                  </div>
                  <Button onClick={goToAuth} variant="outline" className="w-full">
                    Login with Email
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Join the Network</CardTitle>
                <CardDescription>
                  List your venue or club and reach more customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Tabs defaultValue="venue" className="w-full mb-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="venue" onClick={() => setBusinessType("venue")}>Venue</TabsTrigger>
                      <TabsTrigger value="club" onClick={() => setBusinessType("club")}>Club</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 hover:border-primary transition-colors">
                      <div className="font-bold mb-1">Standard Plan</div>
                      <div className="text-2xl font-bold mb-2">$49.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">✓</div>
                          <span>Post events to calendar</span>
                        </li>
                      </ul>
                    </div>
                    <div className="border rounded-md p-4 bg-muted/20 hover:border-primary transition-colors">
                      <div className="font-bold mb-1">Premium Plan</div>
                      <div className="text-2xl font-bold mb-2">$99.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">✓</div>
                          <span>Post events to calendar</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">✓</div>
                          <span>Genre popularity analytics</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={goToAuth}
                  className="w-full"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {userData ? userData.name : (businessType === "club" ? "Club Dashboard" : "Venue Dashboard")}
                </h2>
                <p className="text-muted-foreground">Manage your events and see genre analytics</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={subscriptionPlan === "premium" ? "bg-purple-500" : "bg-green-500"}>
                  {subscriptionPlan === "premium" ? "Premium Plan" : "Standard Plan"}
                </Badge>
                <Button variant="outline" size="sm">Manage Subscription</Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
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
                  {subscriptionPlan === "premium" ? (
                    <GenrePopularityStats data={genrePopularityData} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-2">Premium Feature</h3>
                      <p className="text-sm text-center text-muted-foreground mb-4">
                        Upgrade to Premium to see detailed genre analytics
                      </p>
                      <Button variant="outline" size="sm" onClick={handleUpgrade}>
                        Upgrade Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {showSubscriptionForm && (
          <VenueSubscriptionForm 
            onClose={() => setShowSubscriptionForm(false)} 
            businessType={businessType}
          />
        )}
      </main>
    </div>
  );
};

export default Venues;
