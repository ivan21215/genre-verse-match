import React from 'react';
import { Search, Filter, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface SearchFilters {
  searchTerm: string;
  genre: string;
  venueType: string;
  minRating: number;
  location: string;
  maxDistance: number;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

const genres = [
  'All Genres', 'Electronic', 'Hip Hop', 'Rock', 'Jazz', 'Pop', 'Classical',
  'R&B', 'Country', 'Folk', 'Reggae', 'Alternative', 'Indie', 'House',
  'Techno', 'Dubstep', 'Drum & Bass', 'Ambient'
];

const venueTypes = ['All Types', 'Venue', 'Club'];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      genre: 'All Genres',
      venueType: 'All Types',
      minRating: 0,
      location: '',
      maxDistance: 50
    });
  };

  const activeFiltersCount = [
    filters.searchTerm,
    filters.genre !== 'All Genres' ? filters.genre : '',
    filters.venueType !== 'All Types' ? filters.venueType : '',
    filters.minRating > 0 ? filters.minRating : '',
    filters.location,
    filters.maxDistance !== 50 ? filters.maxDistance : ''
  ].filter(Boolean).length;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Main Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search venues..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-4 space-y-4">
                {/* Quick Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Genre</label>
                    <Select value={filters.genre} onValueChange={(value) => updateFilter('genre', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <Select value={filters.venueType} onValueChange={(value) => updateFilter('venueType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {venueTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="City or area..."
                        value={filters.location}
                        onChange={(e) => updateFilter('location', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Minimum Rating: {filters.minRating > 0 ? `${filters.minRating} stars` : 'Any'}
                    </label>
                    <Slider
                      value={[filters.minRating]}
                      onValueChange={([value]) => updateFilter('minRating', value)}
                      max={5}
                      min={0}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Distance: {filters.maxDistance}km
                    </label>
                    <Slider
                      value={[filters.maxDistance]}
                      onValueChange={([value]) => updateFilter('maxDistance', value)}
                      max={100}
                      min={1}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="flex justify-center pt-2">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <Badge variant="secondary">
                Search: {filters.searchTerm}
              </Badge>
            )}
            {filters.genre !== 'All Genres' && (
              <Badge variant="secondary">
                Genre: {filters.genre}
              </Badge>
            )}
            {filters.venueType !== 'All Types' && (
              <Badge variant="secondary">
                Type: {filters.venueType}
              </Badge>
            )}
            {filters.minRating > 0 && (
              <Badge variant="secondary">
                Min Rating: {filters.minRating}★
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary">
                Location: {filters.location}
              </Badge>
            )}
            {filters.maxDistance !== 50 && (
              <Badge variant="secondary">
                Distance: {filters.maxDistance}km
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};