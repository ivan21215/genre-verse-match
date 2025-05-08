
export interface Venue {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  genre: string;
  distance: string;
}

export const allVenues: Venue[] = [
  { id: "1", name: "Club Cajke", location: { lat: 45.815, lng: 15.981 }, genre: "Cajke", distance: "0.5km" },
  { id: "2", name: "Trash Disco", location: { lat: 45.813, lng: 15.977 }, genre: "Trash", distance: "0.8km" },
  { id: "3", name: "Pop Palace", location: { lat: 45.810, lng: 15.982 }, genre: "White Girl Music", distance: "1.2km" },
  { id: "4", name: "Techno Temple", location: { lat: 45.817, lng: 15.983 }, genre: "Techno", distance: "0.7km" },
  { id: "5", name: "Hip Hop Haven", location: { lat: 45.814, lng: 15.979 }, genre: "Hip Hop", distance: "0.9km" },
  { id: "6", name: "Rock Republic", location: { lat: 45.812, lng: 15.980 }, genre: "Rock", distance: "1.0km" },
  { id: "7", name: "Rap Tavern", location: { lat: 45.816, lng: 15.984 }, genre: "Rap", distance: "0.6km" },
  { id: "8", name: "Dance Arena", location: { lat: 45.818, lng: 15.986 }, genre: "Dance", distance: "1.1km" },
  { id: "9", name: "Jazz Corner", location: { lat: 45.811, lng: 15.978 }, genre: "Jazz", distance: "0.7km" },
];

export const getVenuesByGenre = (genre: string): Venue[] => {
  return genre === "All" 
    ? allVenues 
    : allVenues.filter(venue => venue.genre === genre);
};
