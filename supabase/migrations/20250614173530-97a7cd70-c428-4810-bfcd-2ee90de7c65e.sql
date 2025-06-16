
-- Create route_fleet_pricing table to store custom pricing for different fleet types per route
CREATE TABLE public.route_fleet_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  fleet_id UUID NOT NULL REFERENCES public.fleet(id) ON DELETE CASCADE,
  custom_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(route_id, fleet_id)
);

-- Add RLS policies
ALTER TABLE public.route_fleet_pricing ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage route fleet pricing
CREATE POLICY "Admins can manage route fleet pricing" 
  ON public.route_fleet_pricing 
  FOR ALL 
  USING (
    is_current_user_superadmin() OR 
    get_current_branch_admin_branch_id() IS NOT NULL
  );

-- Add trigger for updated_at
CREATE TRIGGER set_route_fleet_pricing_updated_at
  BEFORE UPDATE ON public.route_fleet_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create index for better performance
CREATE INDEX idx_route_fleet_pricing_route_id ON public.route_fleet_pricing(route_id);
CREATE INDEX idx_route_fleet_pricing_fleet_id ON public.route_fleet_pricing(fleet_id);
