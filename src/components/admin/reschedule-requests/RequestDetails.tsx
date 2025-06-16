
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { RescheduleRequest } from './types';

interface RequestDetailsProps {
  selectedRequest: RescheduleRequest;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  feeAmount: number;
  setFeeAmount: (amount: number) => void;
  processing: boolean;
  onProcessRequest: (status: 'approved' | 'rejected') => void;
  getStatusColor: (status: string, paymentStatus?: string) => string;
  getRequestStatusText: (status: string, paymentStatus?: string) => string;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({
  selectedRequest,
  adminNotes,
  setAdminNotes,
  feeAmount,
  setFeeAmount,
  processing,
  onProcessRequest,
  getStatusColor,
  getRequestStatusText,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Process Request</h3>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Request Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Current Booking:</p>
              <p className="text-muted-foreground">
                {format(new Date(selectedRequest.current_departure_date), 'PPP')}
              </p>
              <p className="text-muted-foreground">{selectedRequest.current_departure_time}</p>
            </div>
            <div>
              <p className="font-medium">Requested:</p>
              <p className="text-muted-foreground">
                {format(new Date(selectedRequest.requested_departure_date), 'PPP')}
              </p>
              <p className="text-muted-foreground">{selectedRequest.requested_departure_time}</p>
            </div>
          </div>

          {selectedRequest.reason && (
            <div>
              <Label>Customer Reason:</Label>
              <p className="text-sm bg-muted p-3 rounded">{selectedRequest.reason}</p>
            </div>
          )}

          <div>
            <Label htmlFor="feeAmount">Reschedule Fee (KES)</Label>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                id="feeAmount"
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(Number(e.target.value))}
                placeholder="0"
                min="0"
                step="0.01"
                disabled={selectedRequest.status !== 'pending'}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={adminNotes || ''}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this decision..."
              rows={3}
              disabled={selectedRequest.status !== 'pending'}
            />
          </div>

          {selectedRequest.status === 'pending' ? (
            <div className="flex gap-3">
              <Button
                onClick={() => onProcessRequest('approved')}
                disabled={processing}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => onProcessRequest('rejected')}
                disabled={processing}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="bg-muted p-3 rounded">
              <p className="text-sm font-medium">
                Status: <Badge className={getStatusColor(selectedRequest.status, selectedRequest.payment_status)}>
                  {getRequestStatusText(selectedRequest.status, selectedRequest.payment_status)}
                </Badge>
              </p>
              {selectedRequest.admin_notes && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Admin Notes:</span> {selectedRequest.admin_notes}
                </p>
              )}
              {selectedRequest.fee_amount > 0 && (
                <p className="text-sm mt-1">
                  <span className="font-medium">Fee:</span> KES {selectedRequest.fee_amount}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
