
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface ManifestHeaderProps {
  totalPassengers: number;
  totalSeats: number;
}

const ManifestHeader: React.FC<ManifestHeaderProps> = ({ totalPassengers, totalSeats }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {totalPassengers} Passengers
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {totalSeats} Seats
        </Badge>
      </div>
    </div>
  );
};

export default ManifestHeader;
