
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, X, Star, MessageCircle } from 'lucide-react';
import { DeleteReviewDialog } from './ReviewsManagement/DeleteReviewDialog';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  is_approved: boolean;
  user_profile?: {
    id?: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const ReviewsManagement = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Fetch all reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            user_id,
            rating,
            review_text,
            created_at,
            is_approved
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch user profiles separately
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(review => review.user_id))];
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

          if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
          } else if (profiles) {
            // Map profiles to reviews
            const reviewsWithProfiles = data.map(review => {
              const profile = profiles.find(p => p.id === review.user_id);
              return {
                ...review,
                user_profile: profile || null
              };
            });
            return reviewsWithProfiles as Review[];
          }
        }
        
        // If no profiles were fetched, return reviews with null user_profile
        return (data || []).map(review => ({
          ...review,
          user_profile: null
        })) as Review[];
      } catch (error: any) {
        toast.error(`Error loading reviews: ${error.message}`);
        console.error('Error loading reviews:', error);
        return [];
      }
    },
  });

  // Approve review mutation
  const approveMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);
      
      if (error) throw error;
      return reviewId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] });
      toast.success('Review approved successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to approve review: ${error.message}`);
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleDelete = (review: Review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    queryClient.invalidateQueries({ queryKey: ['public-reviews'] });
    setDeleteDialogOpen(false);
    setSelectedReview(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get initials from name
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reviews Management</h2>
          <p className="text-muted-foreground">Approve or remove user reviews</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            User Reviews
          </CardTitle>
          <CardDescription>
            Pending and approved reviews from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            {review.user_profile?.avatar_url ? (
                              <AvatarImage src={review.user_profile.avatar_url} alt={review.user_profile.full_name || 'User'} />
                            ) : (
                              <AvatarFallback>{getInitials(review.user_profile?.full_name)}</AvatarFallback>
                            )}
                          </Avatar>
                          <span>{review.user_profile?.full_name || 'Unknown User'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {review.review_text}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(review.created_at)}</TableCell>
                      <TableCell>
                        {review.is_approved ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {!review.is_approved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleApprove(review.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(review)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-gray-50">
              <p className="text-muted-foreground">No reviews found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Review Dialog */}
      <DeleteReviewDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        review={selectedReview}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default ReviewsManagement;
