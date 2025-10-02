import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserMatch } from '@/hooks/useUserMatching';
import { Users, MapPin, Calendar, Music, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

interface UserMatchesListProps {
  matches: UserMatch[];
  loading: boolean;
  onFindMatches: () => void;
  hasPreference: boolean;
}

const UserMatchesList = ({ matches, loading, onFindMatches, hasPreference }: UserMatchesListProps) => {
  if (!hasPreference) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Preferences Set</h3>
          <p className="text-muted-foreground">
            Please fill out your preferences above to find matching users
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Matching Users
            </CardTitle>
            <CardDescription>
              People with similar music preferences in your area
            </CardDescription>
          </div>
          <Button onClick={onFindMatches} disabled={loading}>
            {loading ? 'Searching...' : 'Find Matches'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No matches found yet. Click "Find Matches" to search for people with similar preferences.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <Card key={match.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{match.profile?.name || 'Anonymous User'}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{match.age} years old</span>
                            <span>•</span>
                            <span className="capitalize">{match.gender.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        <Music className="h-3 w-3 mr-1" />
                        {match.genre}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{match.event_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(match.event_date), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>

                    {match.additional_info && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">{match.additional_info}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserMatchesList;
