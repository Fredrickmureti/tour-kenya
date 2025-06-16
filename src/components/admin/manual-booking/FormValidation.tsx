
export interface FormData {
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  seatNumbers: string;
}

export const validateFormData = (formData: FormData, selectedRoute: any): string | null => {
  if (!formData.passengerName.trim()) {
    return 'Passenger name is required';
  }
  
  if (!formData.fromLocation || !formData.toLocation) {
    return 'Please select both departure and destination locations';
  }
  
  if (!formData.departureDate) {
    return 'Please select a departure date';
  }
  
  if (!formData.departureTime) {
    return 'Please select a departure time';
  }
  
  if (!formData.seatNumbers.trim()) {
    return 'Please provide seat numbers';
  }
  
  if (!selectedRoute) {
    return 'Please select a valid route';
  }
  
  return null;
};

export const parseSeatNumbers = (seatNumbers: string): string[] => {
  return seatNumbers
    .split(',')
    .map(s => s.trim())
    .filter(s => s !== '' && !isNaN(parseInt(s)));
};

export const getInitialFormData = (): FormData => ({
  passengerName: '',
  passengerPhone: '',
  passengerEmail: '',
  fromLocation: '',
  toLocation: '',
  departureDate: '',
  departureTime: '',
  seatNumbers: '',
});
