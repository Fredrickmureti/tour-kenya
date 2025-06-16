
export interface UserRescheduleRequest {
  id: string;
  booking_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string | null;
  admin_notes: string | null;
  fee_amount: number;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  processed_by: string | null;
  current_departure_date: string;
  current_departure_time: string;
  current_route_id: string;
  requested_departure_date: string;
  requested_departure_time: string;
  requested_route_id: string;
  bookings: {
    from_location: string;
    to_location: string;
    route_id: string;
  };
  payment_status?: 'not_applicable' | 'awaiting_payment' | 'paid' | 'failed';
}
