
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';

interface BusSchedule {
  id: string;
  route_id: string;
  bus_id: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  status: string;
  route?: {
    from_location: string;
    to_location: string;
  };
  fleet?: {
    name: string;
    capacity: number;
  };
}

interface SchedulesListProps {
  schedules: BusSchedule[];
  isLoading: boolean;
  onUpdateSchedule: (id: string, updates: any) => void;
  onDeleteSchedule: (id: string) => void;
}

export const SchedulesList: React.FC<SchedulesListProps> = ({
  schedules,
  isLoading,
  onUpdateSchedule,
  onDeleteSchedule
}) => {
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading schedules...</div>;
  }

  if (!schedules || schedules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No schedules found for the selected criteria
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Existing Schedules</h3>
      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Route</label>
                  <p className="font-medium">
                    {schedule.route?.from_location} → {schedule.route?.to_location}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bus</label>
                  <p className="font-medium">{schedule.fleet?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                  <p className="font-medium">
                    {format(new Date(schedule.departure_date), 'MMM dd, yyyy')} at {schedule.departure_time}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Seats</label>
                  <p className="font-medium">
                    {schedule.available_seats} / {schedule.fleet?.capacity}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={getStatusColor(schedule.status)}>
                    {schedule.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSchedule(schedule.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteSchedule(schedule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
