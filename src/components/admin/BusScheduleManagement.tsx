
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus } from 'lucide-react';
import { useBusScheduleData } from './BusScheduleManagement/hooks/useBusScheduleData';
import { DateFilter } from './BusScheduleManagement/components/DateFilter';
import { ScheduleForm } from './BusScheduleManagement/components/ScheduleForm';
import { SchedulesList } from './BusScheduleManagement/components/SchedulesList';

export const BusScheduleManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();

  const {
    schedules,
    isLoading,
    routes,
    fleet,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    isCreating
  } = useBusScheduleData(selectedDate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Bus Schedule Management
          </CardTitle>
          <CardDescription>
            Manage bus assignments to routes and schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DateFilter
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          <ScheduleForm
            routes={routes || []}
            fleet={fleet || []}
            onCreateSchedule={createSchedule}
            isCreating={isCreating}
          />

          <SchedulesList
            schedules={schedules || []}
            isLoading={isLoading}
            onUpdateSchedule={updateSchedule}
            onDeleteSchedule={deleteSchedule}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BusScheduleManagement;
