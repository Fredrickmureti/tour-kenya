
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RequestErrorProps {
  error: string;
  onRetry: () => void;
}

export const RequestError: React.FC<RequestErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reschedule Requests</h2>
        <p className="text-muted-foreground">Manage customer booking reschedule requests</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 border rounded-md bg-red-50">
            <Clock className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Requests</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button
              onClick={onRetry}
              className="flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
