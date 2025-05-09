
export interface Venue {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  genre: string;
  distance: string;
  type: "Venue" | "Club";  // Added type field to distinguish between venues and clubs
}

export const allVenues: Venue[] = [
  { id: "1", name: "Club Cajke", location: { lat: 45.815, lng: 15.981 }, genre: "Cajke", distance: "0.5km", type: "Club" },
  { id: "2", name: "Trash Disco", location: { lat: 45.813, lng: 15.977 }, genre: "Trash", distance: "0.8km", type: "Club" },
  { id: "3", name: "Pop Palace", location: { lat: 45.810, lng: 15.982 }, genre: "White Girl Music", distance: "1.2km", type: "Club" },
  { id: "4", name: "Techno Temple", location: { lat: 45.817, lng: 15.983 }, genre: "Techno", distance: "0.7km", type: "Club" },
  { id: "5", name: "Hip Hop Haven", location: { lat: 45.814, lng: 15.979 }, genre: "Hip Hop", distance: "0.9km", type: "Club" },
  { id: "6", name: "Rock Republic", location: { lat: 45.812, lng: 15.980 }, genre: "Rock", distance: "1.0km", type: "Venue" },
  { id: "7", name: "Rap Tavern", location: { lat: 45.816, lng: 15.984 }, genre: "Rap", distance: "0.6km", type: "Venue" },
  { id: "8", name: "Dance Arena", location: { lat: 45.818, lng: 15.986 }, genre: "Dance", distance: "1.1km", type: "Venue" },
  { id: "9", name: "Jazz Corner", location: { lat: 45.811, lng: 15.978 }, genre: "Jazz", distance: "0.7km", type: "Venue" },
];

export const getVenuesByGenre = (genre: string): Venue[] => {
  return genre === "All" 
    ? allVenues 
    : allVenues.filter(venue => venue.genre === genre);
};

// Add new function to get venues by type
export const getVenuesByType = (type: "Venue" | "Club" | "All"): Venue[] => {
  return type === "All" 
    ? allVenues 
    : allVenues.filter(venue => venue.type === type);
};

// Add new function to get venues by both genre and type
export const getVenuesByGenreAndType = (genre: string, type: "Venue" | "Club" | "All"): Venue[] => {
  const venuesByGenre = getVenuesByGenre(genre);
  return type === "All" 
    ? venuesByGenre 
    : venuesByGenre.filter(venue => venue.type === type);
};
