
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSetup from "@/components/ProfileSetup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, MapPin, Building } from "lucide-react";

const Profile = () => {
  const { user, profile, loading } = useAuth();

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
      
      <div className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        {profile ? (
          <div className="grid gap-6 max-w-2xl mx-auto">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your account details and business information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">Business name</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-sm text-muted-foreground">Email address</p>
                  </div>
                </div>
                
                {profile.business_type && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Badge variant="outline" className="capitalize">
                        {profile.business_type}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">Business type</p>
                    </div>
                  </div>
                )}
                
                {profile.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{profile.address}</p>
                      <p className="text-sm text-muted-foreground">Address</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSetup />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <ProfileSetup />
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
