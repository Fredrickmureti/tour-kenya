
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useFleetData } from '@/hooks/useFleetData';

interface FleetProps {
  fleetImages: string[];
  isLoading: boolean;
}

const Fleet: React.FC<FleetProps> = ({ fleetImages: propFleetImages, isLoading: propIsLoading }) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { fleet, isLoading: fleetLoading } = useFleetData();
  
  useEffect(() => {
    // If fleetImages are provided from the parent, use those
    if (propFleetImages && propFleetImages.length > 0) {
      setImages(propFleetImages);
      setLoading(false);
      return;
    }
    
    // Otherwise use images from the fleet data
    if (fleet && fleet.length > 0) {
      const fleetImages = fleet.map(bus => bus.image_url).slice(0, 3);
      setImages(fleetImages);
      setLoading(false);
      return;
    }
    
    // As a fallback, fetch images from the database
    const fetchFleetImages = async () => {
      try {
        const { data, error } = await supabase
          .from('fleet')
          .select('image_url')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (error) {
          throw error;
        }
        
        // Extract image URLs from the data and handle comma-separated URLs
        const extractedImages = data.flatMap(item => {
          if (item.image_url.includes(',')) {
            return item.image_url.split(',').map(url => url.trim());
          }
          return [item.image_url];
        }).slice(0, 3); // Limit to 3 images
        
        setImages(extractedImages);
      } catch (error) {
        console.error('Error fetching fleet images:', error);
        // Fallback to passed images or empty array
        setImages(propFleetImages || []);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFleetImages();
  }, [propFleetImages, fleet]);

  return (
    <section className="py-20 bg-gradient-to-b from-muted/50 to-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
            Our Premium Fleet
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Travel in comfort with our modern bus fleet featuring premium amenities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(propIsLoading || loading || fleetLoading) ? (
            // Loading state for fleet images
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="rounded-xl overflow-hidden bg-muted aspect-w-16 aspect-h-9 animate-pulse">
                <div className="w-full h-full"></div>
              </div>
            ))
          ) : images.length > 0 ? (
            images.map((image, index) => {
              // Try to find the matching fleet item for this image
              const fleetItem = fleet.find(item => item.image_url === image);
              
              return (
                <div key={index} className="rounded-xl overflow-hidden group relative shadow-soft">
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src={image} 
                      alt={fleetItem?.name || `Fleet ${index + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-6 text-white w-full">
                      <h3 className="text-xl font-bold">{fleetItem?.name || `Premium Coach ${index + 1}`}</h3>
                      <p className="text-sm text-white/90">{fleetItem?.description || "Featuring reclining seats, Wi-Fi, USB ports, and more"}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Fallback if no images found
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="rounded-xl overflow-hidden bg-muted aspect-w-16 aspect-h-9">
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image Available
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link to="/fleet">
            <Button className="bg-brand-600 hover:bg-brand-700 text-white">
              Explore Our Fleet
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Fleet;
