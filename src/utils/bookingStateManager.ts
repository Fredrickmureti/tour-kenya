
interface BookingState {
  routeId?: string;
  branchId?: string;
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  seats?: number[];
  step?: number;
  returnUrl?: string;
  timestamp: number;
}

const BOOKING_STATE_KEY = 'pendingBooking';
const BOOKING_STATE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const saveBookingState = (state: Partial<BookingState>) => {
  try {
    const currentState = getBookingState() || {};
    const newState: BookingState = {
      ...currentState,
      ...state,
      timestamp: Date.now()
    };
    
    localStorage.setItem(BOOKING_STATE_KEY, JSON.stringify(newState));
    console.log('Booking state saved:', newState);
  } catch (error) {
    console.error('Error saving booking state:', error);
  }
};

export const getBookingState = (): BookingState | null => {
  try {
    const saved = localStorage.getItem(BOOKING_STATE_KEY);
    if (!saved) return null;
    
    const state: BookingState = JSON.parse(saved);
    
    // Check if state has expired
    if (Date.now() - state.timestamp > BOOKING_STATE_EXPIRY) {
      clearBookingState();
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Error getting booking state:', error);
    clearBookingState();
    return null;
  }
};

export const clearBookingState = () => {
  try {
    localStorage.removeItem(BOOKING_STATE_KEY);
    console.log('Booking state cleared');
  } catch (error) {
    console.error('Error clearing booking state:', error);
  }
};

export const hasValidBookingState = (): boolean => {
  const state = getBookingState();
  return state !== null;
};
