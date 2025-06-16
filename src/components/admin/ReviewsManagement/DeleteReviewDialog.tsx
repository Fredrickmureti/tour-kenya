
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeleteReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  review: any;
  onSuccess: () => void;
}

export const DeleteReviewDialog: React.FC<DeleteReviewDialogProps> = ({
  isOpen,
  onClose,
  review,
  onSuccess,
}) => {
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', review.id);

      if (error) throw error;

      toast.success('Review deleted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(`Error deleting review: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete this review?
          </p>
          {review && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-foreground">Rating:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                "{review.review_text}"
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
