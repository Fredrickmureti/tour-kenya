
export interface EnhancedReceipt {
  receipt_id: string;
  receipt_number: string;
  booking_id: string;
  passenger_name: string;
  passenger_phone: string;
  route_name: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  generated_at: string;
  branch_name: string;
  receipt_status?: string;
  is_signed_off?: boolean;
  verification_count?: number;
}
