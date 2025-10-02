import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPreference } from '@/hooks/useUserMatching';
import { Calendar, MapPin, Music, User } from 'lucide-react';

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

const GENDERS = ['male', 'female', 'non-binary', 'prefer-not-to-say'];

interface UserPreferenceFormProps {
  userPreference: UserPreference | null;
  onSave: (preference: any) => Promise<{ error: any }>;
  loading: boolean;
}

const UserPreferenceForm = ({ userPreference, onSave, loading }: UserPreferenceFormProps) => {
  const [formData, setFormData] = useState({
    genre: '',
    age: '',
    gender: '',
    event_location: '',
    event_date: '',
    additional_info: '',
  });

  useEffect(() => {
    if (userPreference) {
      setFormData({
        genre: userPreference.genre,
        age: userPreference.age.toString(),
        gender: userPreference.gender,
        event_location: userPreference.event_location,
        event_date: userPreference.event_date,
        additional_info: userPreference.additional_info || '',
      });
    }
  }, [userPreference]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const preference = {
      genre: formData.genre,
      age: parseInt(formData.age),
      gender: formData.gender,
      event_location: formData.event_location,
      event_date: formData.event_date,
      additional_info: formData.additional_info,
    };

    await onSave(preference);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = 
    formData.genre &&
    formData.age &&
    parseInt(formData.age) > 0 &&
    parseInt(formData.age) < 150 &&
    formData.gender &&
    formData.event_location &&
    formData.event_date;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Event Preferences</CardTitle>
        <CardDescription>
          Share your music preferences and event plans to find like-minded people
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="genre" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Preferred Genre
            </Label>
            <Select value={formData.genre} onValueChange={(value) => handleChange('genre', value)}>
              <SelectTrigger id="genre">
                <SelectValue placeholder="Select your favorite genre" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Age
              </Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="150"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="Enter your age"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Gender
              </Label>
              <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Event Location
            </Label>
            <Input
              id="event_location"
              type="text"
              value={formData.event_location}
              onChange={(e) => handleChange('event_location', e.target.value)}
              placeholder="e.g., New York, Brooklyn"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Event Date
            </Label>
            <Input
              id="event_date"
              type="date"
              value={formData.event_date}
              onChange={(e) => handleChange('event_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_info">Additional Information (Optional)</Label>
            <Textarea
              id="additional_info"
              value={formData.additional_info}
              onChange={(e) => handleChange('additional_info', e.target.value)}
              placeholder="Share any additional details about your event plans..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={!isFormValid || loading} className="w-full">
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserPreferenceForm;
