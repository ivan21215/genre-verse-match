
import React from "react";

const MapView = () => {
  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
      <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center">
        <div className="text-muted-foreground mb-3">Interactive Map Coming Soon</div>
        <div className="w-full max-w-md px-6">
          <div className="h-[300px] bg-secondary border border-border rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-muted mb-4 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary animate-pulse-glow"></div>
              </div>
              <div className="text-foreground font-medium">Venues Near You</div>
              <div className="text-sm text-muted-foreground mt-1">San Francisco, CA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
