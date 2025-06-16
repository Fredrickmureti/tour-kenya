
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FleetItem {
  id: string;
  name: string;
  description: string;
  capacity: number;
  features: string[];
  image_url: string;
}

export const useFleet = () => {
  const [fleet, setFleet] = useState<FleetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFleet = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('fleet')
          .select('*')
          .order('name');
        
        if (error) {
          setError(error.message);
          toast.error('Failed to load fleet data');
          console.error('Error fetching fleet:', error);
        } else {
          setFleet(data || []);
        }
      } catch (error: any) {
        setError(error.message);
        toast.error('An unexpected error occurred');
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFleet();
  }, []);

  return { fleet, isLoading, error };
};
