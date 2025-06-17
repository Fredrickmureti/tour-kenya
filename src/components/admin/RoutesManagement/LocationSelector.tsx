
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filteredLocations: Array<{ id: string; name: string }>;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onValueChange,
  placeholder,
  searchValue,
  onSearchChange,
  filteredLocations
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <div className="flex items-center px-3 pb-2">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <Input
          placeholder="Search locations..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-full bg-transparent border-0 shadow-none focus-visible:ring-0"
        />
      </div>
      {filteredLocations.map((location) => (
        <SelectItem key={location.id} value={location.name}>
          {location.name}
        </SelectItem>
      ))}
      {filteredLocations.length === 0 && (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          No locations found
        </div>
      )}
    </SelectContent>
  </Select>
);
