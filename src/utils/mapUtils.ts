
// Map utility functions

// Color utility to get a color for each genre
export const getGenreColor = (genre: string): string => {
  const genreColors: Record<string, string> = {
    'Techno': '#ff6b6b',
    'Hip Hop': '#48dbfb',
    'Rock': '#ff9f43',
    'Jazz': '#1dd1a1',
    'Pop': '#54a0ff',
    'R&B': '#5f27cd',
    'Dance': '#00d2d3',
    'Rap': '#8854d0',
    'Cajke': '#ee5253',
    'Trash': '#2e86de', 
    'White Girl Music': '#ff9ff3',
    // Default color for any other genres
    'default': '#576574'
  };

  return genreColors[genre] || genreColors.default;
};

// Launch navigation to a destination
export const launchNavigation = (lat: number, lng: number): void => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
};

// Calculate distance between two points using the Haversine formula
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};
