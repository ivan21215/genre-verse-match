
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapView from "@/components/MapView";

const Map = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-8">Find Venues Near You</h1>
        
        <div className="h-[600px] md:h-[700px] relative rounded-xl overflow-hidden">
          <MapView />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Map;
