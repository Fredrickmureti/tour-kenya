
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleFormProps {
  routes: any[];
  fleet: any[];
  onCreateSchedule: (scheduleData: any) => void;
  isCreating: boolean;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  routes,
  fleet,
  onCreateSchedule,
  isCreating
}) => {
  const [newSchedule, setNewSchedule] = useState({
    route_id: '',
    bus_id: '',
    departure_date: '',
    departure_time: '',
    available_seats: 40,
    status: 'active'
  });

  const handleCreateSchedule = () => {
    if (!newSchedule.route_id || !newSchedule.bus_id || !newSchedule.departure_date || !newSchedule.departure_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    onCreateSchedule(newSchedule);
    setNewSchedule({
      route_id: '',
      bus_id: '',
      departure_date: '',
      departure_time: '',
      available_seats: 40,
      status: 'active'
    });
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Create New Schedule</h3>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label className="text-sm font-medium">Route</label>
          <Select
            value={newSchedule.route_id}
            onValueChange={(value) => setNewSchedule({...newSchedule, route_id: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select route" />
            </SelectTrigger>
            <SelectContent>
              {routes?.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.from_location} → {route.to_location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Bus</label>
          <Select
            value={newSchedule.bus_id}
            onValueChange={(value) => {
              const selectedBus = fleet?.find(b => b.id === value);
              setNewSchedule({
                ...newSchedule, 
                bus_id: value,
                available_seats: selectedBus?.capacity || 40
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bus" />
            </SelectTrigger>
            <SelectContent>
              {fleet?.map((bus) => (
                <SelectItem key={bus.id} value={bus.id}>
                  {bus.name} ({bus.capacity} seats)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Date</label>
          <Input
            type="date"
            value={newSchedule.departure_date}
            onChange={(e) => setNewSchedule({...newSchedule, departure_date: e.target.value})}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Time</label>
          <Input
            type="time"
            value={newSchedule.departure_time}
            onChange={(e) => setNewSchedule({...newSchedule, departure_time: e.target.value})}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <Select
            value={newSchedule.status}
            onValueChange={(value) => setNewSchedule({...newSchedule, status: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button 
            onClick={handleCreateSchedule} 
            className="w-full"
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};
