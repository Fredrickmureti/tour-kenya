
export interface Route {
  id: string;
  from_location: string;
  to_location: string;
  duration: string;
  departure_times: string[];
  price: number;
  branch_id: string;
}

export interface BookingResponse {
  booking_id: string;
  receipt_id: string;
  receipt_number: string;
  amount_paid: number;
  payment_date: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  seat_numbers: string[];
  branch_id: string;
}

export interface BookingFormData {
  fromLocation: string;
  toLocation: string;
  selectedDate: Date | undefined;
  selectedTime: string;
  selectedSeats: number[];
  selectedBusId: string;
  selectedFleetName: string;
  paymentMethod: string;
  fleetPriceMultiplier: number;
}
