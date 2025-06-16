
-- Add a foreign key to link reschedule requests with their corresponding bookings
ALTER TABLE public.reschedule_requests
ADD CONSTRAINT fk_booking
FOREIGN KEY (booking_id)
REFERENCES public.bookings(id)
ON DELETE CASCADE;

-- Add a foreign key to link reschedule requests to users
ALTER TABLE public.reschedule_requests
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Enable Row Level Security to ensure users only see their own requests
ALTER TABLE public.reschedule_requests ENABLE ROW LEVEL SECURITY;

-- Add a policy so users can view their own reschedule requests
CREATE POLICY "Allow users to see their own reschedule requests"
ON public.reschedule_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Add a policy so users can create their own reschedule requests
CREATE POLICY "Allow users to create their own reschedule requests"
ON public.reschedule_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

