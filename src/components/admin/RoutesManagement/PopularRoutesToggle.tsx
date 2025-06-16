
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PopularRoutesToggleProps {
  routeId: string;
  isPopular: boolean;
  onToggle: (routeId: string, isPopular: boolean) => void;
}

export const PopularRoutesToggle: React.FC<PopularRoutesToggleProps> = ({ 
  routeId,
  isPopular,
  onToggle
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePopular = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('routes')
        .update({ is_popular: !isPopular })
        .eq('id', routeId);
      
      if (error) {
        toast.error(`Failed to update route: ${error.message}`);
        console.error('Error updating route:', error);
        return;
      }
      
      onToggle(routeId, !isPopular);
      toast.success(`Route ${!isPopular ? 'added to' : 'removed from'} popular routes`);
    } catch (error: any) {
      toast.error(`Unexpected error: ${error.message}`);
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id={`popular-toggle-${routeId}`} 
        checked={isPopular} 
        onCheckedChange={handleTogglePopular}
        disabled={isLoading}
      />
      <Label htmlFor={`popular-toggle-${routeId}`}>
        {isPopular ? 'Popular' : 'Not Popular'}
      </Label>
    </div>
  );
};

export default PopularRoutesToggle;
