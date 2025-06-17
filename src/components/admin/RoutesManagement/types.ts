
import * as z from 'zod';

export const routeSchema = z.object({
  from_location: z.string().min(1, { message: 'From location is required' }),
  to_location: z.string().min(1, { message: 'To location is required' }),
  base_price: z.coerce.number().min(1, { message: 'Base price must be at least 1' }),
  duration: z.string().min(1, { message: 'Duration is required' }),
  departure_times: z.string().min(1, { message: 'At least one departure time is required' }),
  fleet_pricing: z.record(z.coerce.number().min(1, { message: 'Fleet price must be at least 1' })).optional(),
});

export type RouteFormValues = z.infer<typeof routeSchema>;

export interface RouteWithFleet {
  id: string;
  from_location: string;
  to_location: string;
  price: number;
  duration: string;
  departure_times: string[];
  is_popular: boolean;
  fleetOptions?: Array<{
    id: string;
    name: string;
    price: number;
    features: string[];
  }>;
}
