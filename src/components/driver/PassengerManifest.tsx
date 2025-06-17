
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { usePassengerManifest } from './passenger-manifest/usePassengerManifest';
import PassengerCard from './passenger-manifest/PassengerCard';
import ManifestHeader from './passenger-manifest/ManifestHeader';
import EmptyManifest from './passenger-manifest/EmptyManifest';

const PassengerManifest: React.FC = () => {
  const { todayManifest, isLoading, totalPassengers, totalSeats } = usePassengerManifest();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardTitle className="flex items-center text-slate-800">
          <Users className="h-6 w-6 mr-3 text-blue-500" />
          Today's Passenger Manifest
        </CardTitle>
        <CardDescription>
          Passengers scheduled for your routes today
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!todayManifest?.length ? (
          <EmptyManifest />
        ) : (
          <div className="space-y-4">
            <ManifestHeader totalPassengers={totalPassengers} totalSeats={totalSeats} />
            <div className="space-y-4">
              {todayManifest.map((passenger) => (
                <PassengerCard key={passenger.id} passenger={passenger} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassengerManifest;
