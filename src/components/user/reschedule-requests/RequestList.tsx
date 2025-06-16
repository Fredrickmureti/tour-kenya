
import React from 'react';
import { Calendar } from 'lucide-react';
import { UserRescheduleRequest } from './types';
import { RequestCard } from './RequestCard';

interface RequestListProps {
  requests: UserRescheduleRequest[];
  statusFilter: string;
  onPay: (requestId: string) => void;
}

export const RequestList: React.FC<RequestListProps> = ({ requests, statusFilter, onPay }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-gray-50">
        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-muted-foreground mb-2">No reschedule requests found</p>
        <p className="text-sm text-gray-500">
          {statusFilter !== 'all' 
            ? `No ${statusFilter} requests found` 
            : "You haven't made any reschedule requests yet"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} onPay={onPay} />
      ))}
    </div>
  );
};
