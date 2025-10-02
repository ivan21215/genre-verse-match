import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumImage?: string;
  popularity: number;
  previewUrl?: string;
  externalUrl: string;
  duration: number;
}

export const useSpotifyAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const { toast } = useToast();

  const fetchPopularTracksByGenre = async (genre: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('spotify-genre-analytics', {
        body: { genre }
      });

      if (error) {
        console.error('Error fetching Spotify data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch popular tracks from Spotify",
          variant: "destructive",
        });
        return;
      }

      setTracks(data.tracks || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    tracks,
    fetchPopularTracksByGenre,
  };
};
