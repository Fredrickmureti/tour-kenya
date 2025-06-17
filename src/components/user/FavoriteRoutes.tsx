
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, MapPin, Clock, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FavoriteRoute {
  id: string;
  user_id: string;
  route_id: string;
  created_at: string;
  routes: {
    from_location: string;
    to_location: string;
    duration: string;
    price: number;
    departure_times: string[];
  };
}

const FavoriteRoutes: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: favoriteRoutes, isLoading } = useQuery({
    queryKey: ['favorite-routes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('favorite_routes')
        .select(`
          *,
          routes (
            from_location,
            to_location,
            duration,
            price,
            departure_times
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FavoriteRoute[];
    },
    enabled: !!user?.id,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from('favorite_routes')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-routes'] });
      toast.success('Route removed from favorites');
    },
    onError: (error) => {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite route');
    },
  });

  const handleBookRoute = (routeId: string) => {
    navigate(`/booking/${routeId}`);
  };

  const handleRemoveFavorite = (favoriteId: string) => {
    removeFavoriteMutation.mutate(favoriteId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-500" />
          Favorite Routes
        </CardTitle>
        <CardDescription>
          Quick access to your frequently traveled routes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {favoriteRoutes?.length === 0 ? (
          <div className="text-center py-12 border rounded-md bg-gray-50">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-muted-foreground mb-4">No favorite routes yet</p>
            <Button onClick={() => navigate('/routes')}>
              Browse Routes
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteRoutes?.map((favorite) => (
              <Card key={favorite.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-lg">
                        {favorite.routes.from_location} → {favorite.routes.to_location}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{favorite.routes.duration}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        From KSh {favorite.routes.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {favorite.routes.departure_times.length} departures/day
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {favorite.routes.departure_times.slice(0, 3).map((time, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {time}
                      </Badge>
                    ))}
                    {favorite.routes.departure_times.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{favorite.routes.departure_times.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleBookRoute(favorite.route_id)}
                      size="sm"
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoriteRoutes;
