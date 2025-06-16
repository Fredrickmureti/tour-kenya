
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { UserRescheduleRequest } from './types';
import { getStatusColor, getRequestStatusText, formatDate, formatDateTime } from './utils';

interface RequestCardProps {
  request: UserRescheduleRequest;
  onPay: (requestId: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onPay }) => {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {request.bookings.from_location} → {request.bookings.to_location}
            </span>
          </div>
          <Badge className={getStatusColor(request.status, request.payment_status)}>
            {getRequestStatusText(request.status, request.payment_status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Current Journey</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                {formatDate(request.current_departure_date)}
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-2 text-gray-400" />
                {request.current_departure_time}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Requested Journey</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                {formatDate(request.requested_departure_date)}
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-2 text-gray-400" />
                {request.requested_departure_time}
              </div>
            </div>
          </div>
        </div>

        {request.reason && (
          <div className="mb-4">
            <h4 className="font-medium text-sm text-gray-700 mb-1">Reason</h4>
            <p className="text-sm text-gray-600">{request.reason}</p>
          </div>
        )}

        {request.fee_amount > 0 && request.status !== 'rejected' && (
          <div className="mb-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">Reschedule Fee</span>
              <span className="text-sm font-bold text-yellow-900">
                KSh {request.fee_amount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {request.admin_notes && (
          <div className="mb-4">
            <h4 className="font-medium text-sm text-gray-700 mb-1">Admin Notes</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{request.admin_notes}</p>
            </div>
          </div>
        )}

        {request.status === 'approved' && request.payment_status === 'awaiting_payment' && request.fee_amount > 0 && (
          <div className="mt-4 flex justify-end">
            <Button onClick={() => onPay(request.id)}>
              Pay KSh {request.fee_amount.toLocaleString()} to Finalize
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
          <span>Requested: {formatDateTime(request.created_at)}</span>
          {request.processed_at && (
            <span>Processed: {formatDateTime(request.processed_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
