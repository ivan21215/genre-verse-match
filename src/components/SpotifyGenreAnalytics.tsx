import { useState, useEffect } from 'react';
import { useSpotifyAnalytics, SpotifyTrack } from '@/hooks/useSpotifyAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, ExternalLink, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const GENRES = [
  'rock',
  'pop',
  'hip-hop',
  'electronic',
  'jazz',
  'classical',
  'country',
  'r&b',
  'reggae',
  'blues',
  'metal',
  'indie',
  'folk',
  'latin',
  'edm',
];

const SpotifyGenreAnalytics = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const { loading, tracks, fetchPopularTracksByGenre } = useSpotifyAnalytics();

  const handleFetchTracks = () => {
    if (selectedGenre) {
      fetchPopularTracksByGenre(selectedGenre);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Spotify Genre Analytics
          </CardTitle>
          <CardDescription>
            Discover what's trending in your genre on Spotify
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleFetchTracks} 
              disabled={!selectedGenre || loading}
            >
              {loading ? 'Loading...' : 'Analyze Genre'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {tracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Tracks in {selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)}
            </CardTitle>
            <CardDescription>
              Most popular tracks based on Spotify data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tracks.map((track: SpotifyTrack, index: number) => (
                <Card key={track.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-2xl font-bold">
                          {index + 1}
                        </div>
                      </div>
                      
                      {track.albumImage && (
                        <img 
                          src={track.albumImage} 
                          alt={track.album}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{track.artists}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                        
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Popularity:</span>
                            <Progress value={track.popularity} className="flex-1 max-w-[200px]" />
                            <span className="font-medium">{track.popularity}/100</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Duration: {formatDuration(track.duration)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a 
                            href={track.externalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Spotify
                          </a>
                        </Button>
                        {track.previewUrl && (
                          <audio 
                            controls 
                            className="w-full"
                            src={track.previewUrl}
                          >
                            Your browser does not support audio playback.
                          </audio>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpotifyGenreAnalytics;
