
import React from 'react';
import { Users } from 'lucide-react';

const EmptyManifest: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
      <p className="text-lg text-gray-500 mb-2">No passengers scheduled</p>
      <p className="text-sm text-gray-400">Check with admin for today's assignments</p>
    </div>
  );
};

export default EmptyManifest;
