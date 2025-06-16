
export interface RescheduleRequest {
  id: string;
  booking_id: string;
  user_id: string;
  current_route_id: string;
  current_departure_date: string;
  current_departure_time: string;
  requested_route_id: string;
  requested_departure_date: string;
  requested_departure_time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes: string | null;
  fee_amount: number;
  created_at: string;
  processed_by?: string;
  processed_at?: string;
  payment_status?: 'not_applicable' | 'awaiting_payment' | 'paid' | 'failed';
  payment_details?: any;
}
