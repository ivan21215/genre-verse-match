import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, X } from "lucide-react";
import { useRSVP } from "@/hooks/useRSVP";
import { useAuth } from "@/contexts/AuthContext";

interface RSVPButtonsProps {
  eventId: string;
  showCounts?: boolean;
}

const RSVPButtons: React.FC<RSVPButtonsProps> = ({ eventId, showCounts = true }) => {
  const { updateRSVP, getRSVPForEvent, getEventRSVPCounts } = useRSVP();
  const { user } = useAuth();
  const [counts, setCounts] = useState({ going: 0, maybe: 0, not_going: 0 });
  const [loading, setLoading] = useState(false);

  const currentRSVP = getRSVPForEvent(eventId);

  useEffect(() => {
    if (showCounts) {
      loadCounts();
    }
  }, [eventId, showCounts]);

  const loadCounts = async () => {
    const rsvpCounts = await getEventRSVPCounts(eventId);
    setCounts(rsvpCounts);
  };

  const handleRSVP = async (status: 'going' | 'maybe' | 'not_going') => {
    setLoading(true);
    await updateRSVP(eventId, status);
    if (showCounts) {
      await loadCounts();
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="text-sm text-muted-foreground">
        Sign in to RSVP to this event
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={currentRSVP?.status === 'going' ? 'default' : 'outline'}
          onClick={() => handleRSVP('going')}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <Check className="h-3 w-3" />
          Going
          {showCounts && counts.going > 0 && (
            <Badge variant="secondary" className="ml-1">
              {counts.going}
            </Badge>
          )}
        </Button>
        
        <Button
          size="sm"
          variant={currentRSVP?.status === 'maybe' ? 'default' : 'outline'}
          onClick={() => handleRSVP('maybe')}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <Clock className="h-3 w-3" />
          Maybe
          {showCounts && counts.maybe > 0 && (
            <Badge variant="secondary" className="ml-1">
              {counts.maybe}
            </Badge>
          )}
        </Button>
        
        <Button
          size="sm"
          variant={currentRSVP?.status === 'not_going' ? 'default' : 'outline'}
          onClick={() => handleRSVP('not_going')}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <X className="h-3 w-3" />
          Can't Go
          {showCounts && counts.not_going > 0 && (
            <Badge variant="secondary" className="ml-1">
              {counts.not_going}
            </Badge>
          )}
        </Button>
      </div>
      
      {currentRSVP && (
        <p className="text-xs text-muted-foreground">
          You are marked as "{currentRSVP.status.replace('_', ' ')}" for this event
        </p>
      )}
    </div>
  );
};

export default RSVPButtons;