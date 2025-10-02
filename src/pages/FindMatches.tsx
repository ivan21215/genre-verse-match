import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMatching } from '@/hooks/useUserMatching';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserPreferenceForm from '@/components/UserPreferenceForm';
import UserMatchesList from '@/components/UserMatchesList';
import { Users } from 'lucide-react';

const FindMatches = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading, userPreference, matches, savePreference, findMatches } = useUserMatching();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Find Your Music Match
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with people who share your music taste and event plans
            </p>
          </div>

          {/* Preference Form */}
          <UserPreferenceForm
            userPreference={userPreference}
            onSave={savePreference}
            loading={loading}
          />

          {/* Matches List */}
          <UserMatchesList
            matches={matches}
            loading={loading}
            onFindMatches={findMatches}
            hasPreference={!!userPreference}
          />

          {/* Info Section */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">How It Works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Fill out your music preferences and event plans</li>
              <li>• We'll find people with the same genre preference on the same day</li>
              <li>• Matches are filtered by similar age (±5 years) and nearby locations</li>
              <li>• Connect with others who share your musical interests</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindMatches;
