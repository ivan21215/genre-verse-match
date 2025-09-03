import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Lock, Mail, User, Building, MapPin } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [businessType, setBusinessType] = useState<"venue" | "club">("venue");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: ""
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (!error) {
      navigate("/");
    }
    
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Basic validation
    if (registerData.password !== registerData.confirmPassword) {
      return;
    }
    
    setIsSubmitting(true);
    
    const { error } = await signUp(
      registerData.email,
      registerData.password,
      registerData.name,
      businessType,
      registerData.address
    );
    
    setIsSubmitting(false);
  };

  const isLoginFormValid = loginData.email.trim() !== "" && loginData.password.trim() !== "";
  
  const isRegisterFormValid = 
    registerData.name.trim() !== "" &&
    registerData.email.trim() !== "" &&
    registerData.password.trim() !== "" &&
    registerData.confirmPassword.trim() !== "" &&
    registerData.address.trim() !== "" &&
    registerData.password === registerData.confirmPassword;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto flex-grow flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {activeTab === "login" ? "Login" : "Register"} as a {businessType === "venue" ? "Venue" : "Club"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "Enter your credentials to access your dashboard" 
                : "Create an account to list your location and events"}
            </CardDescription>
          </CardHeader>
          
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={(v) => setActiveTab(v as "login" | "register")}
            className="w-full"
          >
            <div className="px-6">
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent>
              <div className="mb-4">
                <Tabs defaultValue={businessType} onValueChange={(v) => setBusinessType(v as "venue" | "club")}>
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="venue">Venue</TabsTrigger>
                    <TabsTrigger value="club">Club</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!isLoginFormValid || isSubmitting}
                  >
                    {isSubmitting ? "Signing In..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{businessType === "venue" ? "Venue" : "Club"} Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your business name"
                        className="pl-10"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        name="address"
                        placeholder="123 Main St, City"
                        className="pl-10"
                        value={registerData.address}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!isRegisterFormValid || isSubmitting}
                  >
                    {isSubmitting ? "Registering..." : "Register"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
          
          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-muted-foreground">
              {activeTab === "login" 
                ? "Don't have an account? " 
                : "Already have an account? "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
              >
                {activeTab === "login" ? "Register" : "Login"}
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;