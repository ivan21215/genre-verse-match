import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

interface VenueRatingProps {
  venueId: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VenueRating: React.FC<VenueRatingProps> = ({
  venueId,
  showCount = true,
  size = 'md',
  className = ''
}) => {
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const { getVenueAverageRating } = useReviews();

  useEffect(() => {
    const fetchRating = async () => {
      setLoading(true);
      const result = await getVenueAverageRating(venueId);
      setRating(result);
      setLoading(false);
    };

    fetchRating();
  }, [venueId, getVenueAverageRating]);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="animate-pulse bg-muted rounded w-16 h-4"></div>
      </div>
    );
  }

  if (rating.count === 0) {
    return (
      <div className={`flex items-center gap-1 text-muted-foreground ${textSizeClasses[size]} ${className}`}>
        <Star className={`${sizeClasses[size]} text-gray-300`} />
        <span>No reviews</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(rating.average);
          const isPartial = star === Math.ceil(rating.average) && rating.average % 1 !== 0;
          
          return (
            <div key={star} className="relative">
              <Star className={`${sizeClasses[size]} text-gray-300`} />
              {(isFilled || isPartial) && (
                <Star
                  className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400 absolute top-0 left-0`}
                  style={{
                    clipPath: isPartial 
                      ? `inset(0 ${100 - (rating.average % 1) * 100}% 0 0)`
                      : undefined
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <span className={`${textSizeClasses[size]} text-muted-foreground`}>
        {rating.average.toFixed(1)}
        {showCount && ` (${rating.count})`}
      </span>
    </div>
  );
};