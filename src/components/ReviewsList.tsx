import React, { useState } from 'react';
import { Star, Edit, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useReviews, Review } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { ReviewForm } from './ReviewForm';
import LoadingIndicator from './LoadingIndicator';

interface ReviewsListProps {
  venueId: string;
}

const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className = "" }) => (
  <div className={`flex gap-1 ${className}`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ))}
  </div>
);

export const ReviewsList: React.FC<ReviewsListProps> = ({ venueId }) => {
  const { reviews, loading, deleteReview, getUserReviewForVenue } = useReviews(venueId);
  const { user } = useAuth();
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const userReview = getUserReviewForVenue(venueId);
  const otherReviews = reviews.filter(review => review.user_id !== user?.id);

  if (loading) {
    return <LoadingIndicator />;
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteReview(reviewId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Review Section */}
      {user && (
        <div>
          {userReview ? (
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="font-semibold">Your Review</h3>
                <div className="flex gap-2">
                  <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <ReviewForm
                        venueId={venueId}
                        existingReview={userReview}
                        onSuccess={() => setShowReviewForm(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteReview(userReview.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={userReview.rating} />
                  <span className="text-sm text-muted-foreground">
                    {new Date(userReview.created_at).toLocaleDateString()}
                  </span>
                </div>
                {userReview.comment && (
                  <p className="text-muted-foreground">{userReview.comment}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
              <DialogTrigger asChild>
                <Button className="w-full">Leave a Review</Button>
              </DialogTrigger>
              <DialogContent>
                <ReviewForm
                  venueId={venueId}
                  onSuccess={() => setShowReviewForm(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {/* Other Reviews */}
      <div className="space-y-4">
        <h3 className="font-semibold">
          Reviews ({otherReviews.length})
        </h3>
        
        {otherReviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No reviews yet. Be the first to review this venue!
              </p>
            </CardContent>
          </Card>
        ) : (
          otherReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {review.user_name || 'Anonymous User'}
                    </span>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                    {review.comment && (
                      <p className="text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
