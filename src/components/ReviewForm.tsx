import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReviews, Review } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewFormProps {
  venueId: string;
  existingReview?: Review | null;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  venueId,
  existingReview,
  onSuccess
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  const { createReview, updateReview } = useReviews();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (rating === 0) {
      return;
    }

    setSubmitting(true);
    
    let result;
    if (existingReview) {
      result = await updateReview(existingReview.id, rating, comment);
    } else {
      result = await createReview(venueId, rating, comment);
    }
    
    setSubmitting(false);
    
    if (!result.error) {
      if (!existingReview) {
        setRating(0);
        setComment('');
      }
      onSuccess?.();
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please sign in to leave a review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? 'Edit Your Review' : 'Leave a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredStar || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Comment (optional)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            disabled={rating === 0 || submitting}
            className="w-full"
          >
            {submitting 
              ? (existingReview ? 'Updating...' : 'Posting...') 
              : (existingReview ? 'Update Review' : 'Post Review')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};