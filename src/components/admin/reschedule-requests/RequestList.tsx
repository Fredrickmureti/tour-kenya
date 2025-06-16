
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { RescheduleRequest } from './types';

interface RequestListProps {
  requests: RescheduleRequest[];
  selectedRequest: RescheduleRequest | null;
  onSelectRequest: (request: RescheduleRequest) => void;
  getStatusColor: (status: string, paymentStatus?: string) => string;
  getRequestStatusText: (status: string, paymentStatus?: string) => string;
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  selectedRequest,
  onSelectRequest,
  getStatusColor,
  getRequestStatusText,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Requests List</h3>
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No reschedule requests found</p>
          </CardContent>
        </Card>
      ) : (
        requests.map((request) => (
          <Card
            key={request.id}
            className={`cursor-pointer transition-colors ${
              selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectRequest(request)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Request #{request.id.slice(0, 8)}
                </CardTitle>
                <Badge className={getStatusColor(request.status, request.payment_status)}>
                  {getRequestStatusText(request.status, request.payment_status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <p className="font-medium">Current → Requested</p>
                <p className="text-muted-foreground">
                  {format(new Date(request.current_departure_date), 'MMM dd')} at {request.current_departure_time}
                  {' → '}
                  {format(new Date(request.requested_departure_date), 'MMM dd')} at {request.requested_departure_time}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted: {format(new Date(request.created_at), 'PPp')}
                </p>
                {request.reason && (
                  <p className="text-xs bg-muted p-2 rounded">
                    <span className="font-medium">Reason:</span> {request.reason}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
