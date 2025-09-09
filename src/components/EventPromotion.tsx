import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Share2, Star, Megaphone, Calendar, MapPin, Users } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  genre: string;
  venue?: {
    name: string;
    address: string;
  };
}

interface EventPromotionProps {
  event: Event;
  isOwner?: boolean;
}

const EventPromotion: React.FC<EventPromotionProps> = ({ event, isOwner = false }) => {
  const { toast } = useToast();
  const [isFeatured, setIsFeatured] = useState(false);
  const [promotionBudget, setPromotionBudget] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const handleShare = async (platform: string) => {
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const shareText = `Check out this event: ${event.title} on ${new Date(event.event_date).toLocaleDateString()}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + eventUrl)}`
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(eventUrl);
        toast({ title: "Link copied to clipboard!" });
      } catch (error) {
        toast({ 
          title: "Failed to copy link", 
          variant: "destructive" 
        });
      }
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
      toast({ title: `Shared on ${platform}!` });
    }
  };

  const handleFeatureToggle = async (featured: boolean) => {
    setIsFeatured(featured);
    // Here you would typically update the database
    toast({ 
      title: featured ? "Event featured!" : "Event unfeatured",
      description: featured ? "Your event will appear in featured listings" : "Event removed from featured listings"
    });
  };

  const handlePromotionSubmit = async () => {
    if (!promotionBudget) {
      toast({ 
        title: "Please enter a promotion budget", 
        variant: "destructive" 
      });
      return;
    }

    // Here you would integrate with promotion services
    toast({ 
      title: "Promotion campaign created!",
      description: `Budget: $${promotionBudget} allocated for event promotion`
    });
  };

  const formatEventDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Event Preview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Preview
            </CardTitle>
            {isFeatured && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-bold">{event.title}</h3>
            <p className="text-muted-foreground">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatEventDate(event.event_date)} at {formatTime(event.start_time)}</span>
            </div>
            
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.venue.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{event.genre}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="bg-sky-500 text-white hover:bg-sky-600"
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('whatsapp')}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('copy')}
            >
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Tools (Owner Only) */}
      {isOwner && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Feature Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Featured Event</Label>
                  <p className="text-sm text-muted-foreground">
                    Featured events appear at the top of search results
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={handleFeatureToggle}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Promotion Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="budget">Promotion Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="10"
                  max="1000"
                  step="10"
                  value={promotionBudget}
                  onChange={(e) => setPromotionBudget(e.target.value)}
                  placeholder="50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum $10, maximum $1000 per campaign
                </p>
              </div>

              <div>
                <Label htmlFor="message">Custom Promotion Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a custom message to promote your event..."
                  maxLength={280}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {customMessage.length}/280 characters
                </p>
              </div>

              <Button 
                onClick={handlePromotionSubmit}
                className="w-full"
                disabled={!promotionBudget}
              >
                Start Promotion Campaign
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EventPromotion;