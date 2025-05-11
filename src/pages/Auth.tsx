
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, Building, MapPin } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [businessType, setBusinessType] = useState<"venue" | "club">("venue");
  
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

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would validate against a backend
    const storedUser = localStorage.getItem(`${businessType}_${loginData.email}`);
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.password === loginData.password) {
        // Store logged in state
        localStorage.setItem("currentUser", JSON.stringify({
          email: user.email,
          name: user.name,
          businessType: businessType,
          address: user.address
        }));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });
        
        navigate("/venues");
        return;
      }
    }
    
    toast({
      title: "Login Failed",
      description: "Invalid email or password. Please try again.",
      variant: "destructive"
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Registration Error",
        description: "Passwords do not match!",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user already exists
    const existingUser = localStorage.getItem(`${businessType}_${registerData.email}`);
    if (existingUser) {
      toast({
        title: "Registration Error",
        description: "A user with this email already exists!",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send data to a backend
    localStorage.setItem(`${businessType}_${registerData.email}`, JSON.stringify({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password, // In a real app, never store passwords in plain text
      address: registerData.address,
      businessType: businessType,
      registeredAt: new Date().toISOString()
    }));
    
    // Store logged in state
    localStorage.setItem("currentUser", JSON.stringify({
      email: registerData.email,
      name: registerData.name,
      businessType: businessType,
      address: registerData.address
    }));
    
    toast({
      title: "Registration Successful",
      description: `Your ${businessType} account has been created!`,
    });
    
    navigate("/venues");
  };

  const isLoginFormValid = loginData.email.trim() !== "" && loginData.password.trim() !== "";
  
  const isRegisterFormValid = 
    registerData.name.trim() !== "" &&
    registerData.email.trim() !== "" &&
    registerData.password.trim() !== "" &&
    registerData.confirmPassword.trim() !== "" &&
    registerData.address.trim() !== "" &&
    registerData.password === registerData.confirmPassword;

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
                  
                  <Button type="submit" className="w-full" disabled={!isLoginFormValid}>
                    Login
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
                  
                  <Button type="submit" className="w-full" disabled={!isRegisterFormValid}>
                    Register
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
