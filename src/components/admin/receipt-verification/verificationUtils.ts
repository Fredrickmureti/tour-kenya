
export interface ReceiptVerification {
  valid: boolean;
  message: string;
  receipt_id?: string;
  receipt_number?: string;
  booking_id?: string;
  amount?: number;
  payment_status?: string;
  generated_at?: string;
  passenger_name?: string;
  route?: string;
}

export const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const parseVerificationResponse = (data: any): ReceiptVerification => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return { valid: false, message: 'Invalid response format' };
    }
  } else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as unknown as ReceiptVerification;
  } else {
    return { valid: false, message: 'Receipt not found' };
  }
};
