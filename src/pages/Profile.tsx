
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSetup from "@/components/ProfileSetup";

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="max-w-md mx-auto">
          <ProfileSetup />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
