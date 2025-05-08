
import React from "react";
import { getGoogleMapsUrl } from "@/utils/mapUtils";

interface MapFrameProps {
  userLocation: { lat: number; lng: number } | null;
}

const MapFrame: React.FC<MapFrameProps> = ({ userLocation }) => {
  const center = userLocation ? `${userLocation.lat},${userLocation.lng}` : '45.815,15.981';
  const mapUrl = getGoogleMapsUrl(center);

  return (
    <div className="absolute inset-0">
      <iframe
        title="Google Map"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
      ></iframe>
    </div>
  );
};

export default MapFrame;
