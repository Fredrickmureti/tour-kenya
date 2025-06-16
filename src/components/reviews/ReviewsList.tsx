
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  user_id: string;
  user_profile?: {
    id?: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const ReviewsList = () => {
  // Fetch approved reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['public-reviews'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            review_text,
            created_at,
            user_id
          `)
          .eq('is_approved', true)
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse p-6 rounded-lg h-48"></div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Quote className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium">No reviews yet</h3>
        <p className="text-gray-500">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                {review.user_profile?.avatar_url ? (
                  <AvatarImage src={review.user_profile.avatar_url} alt={review.user_profile?.full_name || 'User'} />
                ) : (
                  <AvatarFallback>{getInitials(review.user_profile?.full_name)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="font-medium">{review.user_profile?.full_name || 'Anonymous'}</div>
                <div className="text-sm text-gray-500">{formatDate(review.created_at)}</div>
              </div>
            </div>
            <div className="flex">{renderStars(review.rating)}</div>
          </div>
          <div className="text-gray-700">{review.review_text}</div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
