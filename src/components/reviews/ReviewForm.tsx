
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10, {
    message: "Review must be at least 10 characters.",
  }),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const ReviewForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      reviewText: '',
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    if (!user) {
      toast.error('You must be logged in to submit a review');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          rating: values.rating,
          review_text: values.reviewText,
          is_approved: false,
        });

      if (error) throw error;

      toast.success('Thank you! Your review has been submitted for approval');
      form.reset({ rating: 0, reviewText: '' });
    } catch (error: any) {
      toast.error(`Failed to submit review: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    form.setValue('rating', rating);
  };

  const renderStars = () => {
    const rating = form.getValues('rating');
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none"
          >
            <Star 
              className={`h-8 w-8 transition-colors ${
                (hoveredRating ? star <= hoveredRating : star <= rating) 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="border p-6 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
        <p className="text-gray-600">Please log in to submit a review.</p>
      </div>
    );
  }

  return (
    <div className="border p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="rating"
            render={() => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  {renderStars()}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reviewText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Review</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what you think about our service..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-brand-600 hover:bg-brand-700"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            All reviews are moderated before appearing on the site.
          </p>
        </form>
      </Form>
    </div>
  );
};

export default ReviewForm;
