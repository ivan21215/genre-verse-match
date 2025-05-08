
import React from "react";
import { MapPin } from "lucide-react";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="flex flex-col items-center">
        <MapPin className="h-8 w-8 animate-bounce text-primary" />
        <p className="mt-2">Finding your location...</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
