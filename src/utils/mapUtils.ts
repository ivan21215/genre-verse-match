
// Utility functions for the map

export const getGenreColor = (genre: string): string => {
  switch(genre.toLowerCase()) {
    case 'cajke': return '#FF5733';
    case 'trash': return '#8e24aa';
    case 'white girl music': return '#fb5607';
    case 'techno': return '#118ab2';
    case 'hip hop': return '#ff006e';
    case 'rock': return '#8338ec';
    case 'rap': return '#f97316';
    case 'dance': return '#ec4899';
    case 'jazz': return '#f59e0b';
    default: return '#7733FF';
  }
};

export const getGoogleMapsUrl = (center: string): string => {
  return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${center}&zoom=15`;
};

export const launchNavigation = (lat: number, lng: number): void => {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  window.open(mapUrl, '_blank');
  
  // Add vibration feedback if supported
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
};
