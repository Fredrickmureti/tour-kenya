import React from 'react';
import { useHomeData } from './hooks/useHomeData';
import Hero from './components/Hero';
import PopularRoutes from './components/PopularRoutes';
import Features from './components/Features';
import Fleet from './components/Fleet';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner'; // Corrected toast import

interface Branch {
  id: string;
  name: string;
  // Ensure this matches the actual structure returned by get_branches_for_booking
  // e.g., if it returns code, address, etc., add them here.
}

const HomePage: React.FC = () => {
  const { popularRoutes, fleetImages, locations, isLoading: isLoadingHomeData } = useHomeData();

  const { data: branches, isLoading: isLoadingBranches } = useQuery<Branch[], Error>({
    queryKey: ['branches-for-booking'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_branches_for_booking');

      if (error) {
        console.error('Error fetching branches for booking:', error);
        toast.error(`Failed to load branches: ${error.message}`);
        return [];
      }
      // It's crucial that the actual data structure from RPC matches Branch[]
      // If `data` is not an array of objects with `id` and `name`, this will fail silently or runtime.
      return (data as Branch[]) || []; 
    },
  });

  const isLoading = isLoadingHomeData || isLoadingBranches;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Search Form */}
      <Hero locations={locations} isLoading={isLoading} branches={branches || []} />
      
      {/* Popular Routes Section */}
      <PopularRoutes routes={popularRoutes} isLoading={isLoading} />
      
      {/* Features Section */}
      <Features />
      
      {/* Fleet Section */}
      <Fleet fleetImages={fleetImages} isLoading={isLoading} />
      
      {/* Testimonials Section */}
      <Testimonials />
      
      {/* CTA Section */}
      <CallToAction />
    </div>
  );
};

export default HomePage;
