
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
