
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wifi, Tv, Thermometer, UsbIcon, Coffee, Music, Battery, PlugZap } from 'lucide-react';

export interface FleetType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  features: string[];
  image_url: string;
  price?: string; // Optional as it might not be in the database
}

export interface BusFeature {
  name: string;
  icon: JSX.Element;
  available: Record<string, boolean>; // Dynamic keys based on bus types
}

export function useFleetData() {
  const [fleet, setFleet] = useState<FleetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFleet() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('fleet')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        // Transform database data to match our interface
        const transformedData: FleetType[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          capacity: item.capacity,
          features: Array.isArray(item.features) ? item.features : [],
          image_url: item.image_url,
          // Adding a price string based on bus type (you might want to add this to your db later)
          price: `Starting from KSh ${item.name === 'Standard' ? '3,500' : 
                 item.name === 'Premium' ? '5,000' : 
                 item.name === 'Luxury' ? '7,500' : '4,000'}`
        }));
        
        setFleet(transformedData);
      } catch (error) {
        console.error('Error fetching fleet data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch fleet data');
        toast.error('Failed to load fleet data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFleet();
  }, []);

  // Creates a map of all available features across all bus types
  const getFeaturesList = () => {
    // Extract all unique features from all buses
    const allFeatures = new Set<string>();
    fleet.forEach(bus => {
      bus.features.forEach(feature => {
        allFeatures.add(feature);
      });
    });
    
    // Create a map of features and their availability for each bus type
    const busTypes = fleet.map(bus => bus.name);
    const featuresList: BusFeature[] = Array.from(allFeatures).map(feature => {
      const available: Record<string, boolean> = {};
      
      busTypes.forEach(busType => {
        const bus = fleet.find(b => b.name === busType);
        available[busType.toLowerCase()] = bus ? bus.features.includes(feature) : false;
      });
      
      // Determine appropriate icon based on feature name
      let icon = <></>;
      
      if (feature.toLowerCase().includes('wifi')) {
        icon = <Wifi className="h-5 w-5" />;
      } else if (feature.toLowerCase().includes('tv') || feature.toLowerCase().includes('screen')) {
        icon = <Tv className="h-5 w-5" />;
      } else if (feature.toLowerCase().includes('air') || feature.toLowerCase().includes('ac')) {
        icon = <Thermometer className="h-5 w-5" />;
      } else if (feature.toLowerCase().includes('usb')) {
        icon = <UsbIcon className="h-5 w-5" />;
      } else if (feature.toLowerCase().includes('snack') || feature.toLowerCase().includes('beverage')) {
        icon = <Coffee className="h-5 w-5" />;
      } else if (feature.toLowerCase().includes('entertainment') || feature.toLowerCase().includes('music')) {
        icon = <Music className="h-5 w-5" />;
      } else if (feature.toLowerCase().includes('charging') || feature.toLowerCase().includes('power')) {
        icon = <Battery className="h-5 w-5" />; // Changed from ChargingPile to Battery
      } else if (feature.toLowerCase().includes('socket') || feature.toLowerCase().includes('outlet')) {
        icon = <PlugZap className="h-5 w-5" />;
      }
      
      return {
        name: feature,
        icon,
        available
      };
    });
    
    return featuresList;
  };

  return {
    fleet,
    isLoading,
    error,
    getFeaturesList
  };
}
