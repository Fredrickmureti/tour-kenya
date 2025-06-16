
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Wifi, 
  Battery, 
  Tv, 
  Coffee, 
  Thermometer, 
  Headphones,
  Check,
  Users,
  Command
} from 'lucide-react';
import { useFleetData, FleetType, BusFeature } from '@/hooks/useFleetData';
import { toast } from 'sonner';

// Map of feature names to icons
const featureIconMap: Record<string, React.ReactElement> = {
  'WiFi': <Wifi />,
  'Free WiFi': <Wifi />,
  'Power Outlets': <Battery />,
  'Entertainment System': <Tv />,
  'Complimentary Snacks': <Coffee />,
  'Climate Control': <Thermometer />,
  'Audio System': <Headphones />,
  'Air Conditioning': <Thermometer />,
  'USB charging': <Battery />
};

// Default icon for features without a specific icon
const defaultIcon = <Command />;

const FleetPage: React.FC = () => {
  const navigate = useNavigate();
  const { fleet, isLoading, error, getFeaturesList } = useFleetData();
  const [activeTab, setActiveTab] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  useEffect(() => {
    // Set the first bus type as active when fleet data loads
    if (fleet.length > 0 && !activeTab) {
      setActiveTab(fleet[0].id);
    }
  }, [fleet, activeTab]);

  const activeBus = fleet.find(bus => bus.id === activeTab) || fleet[0];
  
  // Get all features with their availability across bus types
  const busFeatures: BusFeature[] = React.useMemo(() => {
    const features = getFeaturesList();
    
    // Add icons to features based on the map or default
    return features.map(feature => ({
      ...feature,
      icon: featureIconMap[feature.name] || defaultIcon
    }));
  }, [getFeaturesList]);

  // Split image URL if there are multiple images (comma separated)
  const getBusImages = (bus?: FleetType) => {
    if (!bus) return [];
    
    // If the image_url contains multiple URLs separated by commas, split them
    if (bus.image_url.includes(',')) {
      return bus.image_url.split(',').map(url => url.trim());
    }
    
    // Otherwise return as a single-item array
    return [bus.image_url];
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-foreground">Failed to load fleet data</h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="bg-brand-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display animate-fade-in">
            Our Premium Fleet
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 animate-fade-in">
            Discover our diverse range of buses designed for your comfort and convenience
          </p>
        </div>
      </section>

      {/* Fleet Tabs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-4 font-display text-foreground">
              Choose Your Perfect Travel Experience
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From affordable standard buses to luxury coaches, we have options for every preference and budget
            </p>
          </div>
          
          {isLoading ? (
            <div className="max-w-5xl mx-auto p-8 border rounded-lg animate-pulse bg-card">
              <div className="h-12 mb-8 bg-muted rounded w-full"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-80 bg-muted rounded"></div>
                  <div className="flex space-x-2">
                    {[1, 2].map((_, i) => (
                      <div key={i} className="w-16 h-16 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                  <div className="h-20 bg-muted rounded"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="h-6 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : fleet.length > 0 ? (
            <Tabs 
              defaultValue={fleet[0].id} 
              value={activeTab}
              onValueChange={setActiveTab}
              className="max-w-5xl mx-auto"
            >
              <TabsList className="grid w-full grid-cols-3">
                {fleet.map((bus) => (
                  <TabsTrigger key={bus.id} value={bus.id} className="text-base py-3">
                    {bus.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {fleet.map((bus) => {
                const busImages = getBusImages(bus);
                return (
                  <TabsContent key={bus.id} value={bus.id} className="mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Image Gallery */}
                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-lg shadow-md">
                          <img 
                            src={busImages[activeImageIndex] || bus.image_url} 
                            alt={`${bus.name} - Image ${activeImageIndex + 1}`}
                            className="w-full object-cover h-80 transition-transform hover:scale-105 duration-300" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                            }}
                          />
                        </div>
                        {busImages.length > 1 && (
                          <div className="flex space-x-2">
                            {busImages.map((image, index) => (
                              <button
                                key={index}
                                className={`rounded-md overflow-hidden border-2 transition-all ${
                                  index === activeImageIndex 
                                    ? 'border-brand-500 opacity-100' 
                                    : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                                onClick={() => setActiveImageIndex(index)}
                              >
                                <img 
                                  src={image} 
                                  alt={`Thumbnail ${index + 1}`} 
                                  className="w-16 h-16 object-cover" 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Bus Details */}
                      <div>
                        <h3 className="text-2xl font-bold mb-3 text-foreground">{bus.name}</h3>
                        <p className="text-muted-foreground mb-6">{bus.description}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="text-brand-600" size={20} />
                          <span className="text-foreground">Capacity: {bus.capacity} passengers</span>
                        </div>
                        <h4 className="text-lg font-semibold mb-3 text-foreground">Features:</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                          {bus.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="text-brand-500 mr-2 mt-1 shrink-0" size={16} />
                              <span className="text-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="text-xl font-bold text-brand-600 mb-6">{bus.price}</div>
                        <Button 
                          className="bg-brand-600 hover:bg-brand-700"
                          onClick={() => navigate(`/routes?busType=${encodeURIComponent(bus.name)}`)}
                        >
                          View Routes with this Bus
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted max-w-5xl mx-auto">
              <p className="text-muted-foreground">No fleet information available</p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 font-display text-foreground">
              Features Comparison
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compare our different bus types to find the perfect match for your travel needs
            </p>
          </div>
          
          {isLoading ? (
            <div className="overflow-x-auto">
              <div className="w-full bg-card rounded-lg shadow-md animate-pulse p-4">
                <div className="h-12 bg-muted rounded mb-4 w-full"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : fleet.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-card rounded-lg shadow-md">
                <thead>
                  <tr>
                    <th className="py-4 px-6 text-left text-foreground">Feature</th>
                    {fleet.map((bus) => (
                      <th key={bus.id} className="py-4 px-6 text-center text-foreground">{bus.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {busFeatures.map((feature, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : 'bg-card'}>
                      <td className="py-4 px-6 flex items-center text-foreground">
                        <span className="mr-2">{feature.icon}</span>
                        {feature.name}
                      </td>
                      {fleet.map((bus) => (
                        <td key={`${bus.id}-${feature.name}`} className="py-4 px-6 text-center">
                          {feature.available[bus.name.toLowerCase()] ? (
                            <Check className="text-green-500 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-muted">
                    <td className="py-4 px-6 font-medium text-foreground">Price Range</td>
                    {fleet.map((bus) => (
                      <td key={`${bus.id}-price`} className="py-4 px-6 text-center text-foreground">
                        {bus.name === 'Standard' ? '$35 - $45' : 
                         bus.name === 'Premium' ? '$50 - $65' : 
                         bus.name === 'Luxury' ? '$75 - $100' : '$40 - $60'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted">
              <p className="text-muted-foreground">No feature comparison available</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Fleet Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 font-display text-foreground">
              Choose Your Bus Type
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect balance of comfort, amenities, and price for your journey
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-w-16 aspect-h-9">
                    <div className="w-full h-48 bg-muted"></div>
                  </div>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-muted rounded mb-4"></div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-4 bg-muted rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {fleet.map((bus) => (
                <Card key={bus.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src={getBusImages(bus)[0]} 
                      alt={bus.name} 
                      className="w-full object-cover h-48" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                      }}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{bus.name}</CardTitle>
                    <CardDescription>{bus.price}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{bus.description}</p>
                    <div className="space-y-2">
                      {bus.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="text-brand-500 mr-2 mt-1 shrink-0" size={16} />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                      {bus.features.length > 3 && (
                        <div className="text-sm text-brand-600">+ {bus.features.length - 3} more features</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full border-brand-500 text-brand-600 hover:bg-brand-50"
                      onClick={() => setActiveTab(bus.id)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-brand-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-display">
            Ready to Experience Our Premium Fleet?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Book your journey today on one of our comfortable buses
          </p>
          <Button className="bg-white text-brand-700 hover:bg-gray-100 px-8 py-6 text-lg" onClick={() => navigate('/routes')}>
            Book Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FleetPage;
