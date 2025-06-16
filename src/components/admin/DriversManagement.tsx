import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search, Car, Clock } from 'lucide-react';
import { AddDriverForm } from './DriversManagement/AddDriverForm';
import { AssignDriverForm } from './DriversManagement/AssignDriverForm';
import { DriverActionsMenu } from './DriversManagement/DriverActionsMenu';
import { useBranch } from '@/contexts/BranchContext';

interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  license_number: string;
  status: string;
  experience_years: number | null;
  total_trips: number | null;
  rating: number | null;
  created_at: string;
  branch_id: string | null; 
  branches?: { name: string } | null; 
  driver_assignments?: {
    bus_id: string | null;
    route_id: string | null;
    fleet?: { name: string } | null;
    routes?: { from_location: string; to_location: string } | null;
  }[];
  driver_auth?: {
    last_login: string | null;
  }[];
}

interface FleetOption {
  id: string;
  name: string;
  branch_id: string | null;
}

interface RouteOption {
  id: string;
  from_location: string;
  to_location: string;
  branch_id: string | null;
}

interface AssignDriverOptions {
  fleetOptions: FleetOption[];
  routeOptions: RouteOption[];
}

const DriversManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const { getCurrentBranchFilter, isSuperAdmin, currentBranch, branches: allBranches } = useBranch();
  
  const { data: drivers, isLoading, refetch } = useQuery<Driver[], Error>({
    queryKey: ['admin-drivers', typeof currentBranch === 'object' ? currentBranch?.id : null, isSuperAdmin], 
    queryFn: async () => {
      const branchIdFilter = getCurrentBranchFilter();
      
      let query = supabase.from('drivers').select(`
        id,
        full_name,
        email,
        phone,
        license_number,
        status,
        experience_years,
        total_trips,
        rating,
        created_at,
        branch_id,
        branches (name),
        driver_assignments(
          bus_id,
          route_id,
          fleet(name),
          routes(from_location, to_location)
        ),
        driver_auth(last_login)
      `);
      
      if (branchIdFilter) {
        query = query.eq('branch_id', branchIdFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
          
      if (error) {
        console.error('Supabase error fetching drivers:', error);
        toast.error(`Error loading drivers: ${error.message}`);
        throw error;
      }
      return data || [];
    }
  });

  const {
    data: assignmentOptions,
    isLoading: isLoadingAssignmentOptions,
    refetch: refetchAssignmentOptions
  } = useQuery<AssignDriverOptions, Error>({
    queryKey: ['assignment-options', selectedDriver?.id, selectedDriver?.branch_id, typeof currentBranch === 'object' ? currentBranch?.id : null, isSuperAdmin],
    queryFn: async () => {
      if (!selectedDriver) return { fleetOptions: [], routeOptions: [] };

      let effectiveBranchIdForFleet = selectedDriver.branch_id;
      if (!effectiveBranchIdForFleet) {
        if (currentBranch && typeof currentBranch === 'object') effectiveBranchIdForFleet = currentBranch.id;
      }

      let effectiveBranchIdForRoutes = selectedDriver.branch_id;
      if (!effectiveBranchIdForRoutes) {
        if (currentBranch && typeof currentBranch === 'object') effectiveBranchIdForRoutes = currentBranch.id;
      }

      let fleetQuery = supabase.from('fleet').select('id, name, branch_id');
      if (effectiveBranchIdForFleet) {
        fleetQuery = fleetQuery.eq('branch_id', effectiveBranchIdForFleet);
      } else if (!isSuperAdmin) {
        const adminBranchId = getCurrentBranchFilter();
        if (adminBranchId) fleetQuery = fleetQuery.eq('branch_id', adminBranchId);
        else return { fleetOptions: [], routeOptions: [] };
      }

      const { data: fleetData, error: fleetError } = await fleetQuery.order('name');
      if (fleetError) {
        toast.error(`Error fetching fleet options: ${fleetError.message}`);
        throw fleetError;
      }

      let routeQuery = supabase.from('routes').select('id, from_location, to_location, branch_id');
      if (effectiveBranchIdForRoutes) {
        routeQuery = routeQuery.eq('branch_id', effectiveBranchIdForRoutes);
      } else if (!isSuperAdmin) {
        const adminBranchId = getCurrentBranchFilter();
        if (adminBranchId) routeQuery = routeQuery.eq('branch_id', adminBranchId);
        else return { fleetOptions: fleetData || [], routeOptions: [] };
      }

      const { data: routeData, error: routeError } = await routeQuery.order('from_location');
      if (routeError) {
        toast.error(`Error fetching route options: ${routeError.message}`);
        throw routeError;
      }
      
      return {
        fleetOptions: fleetData || [],
        routeOptions: routeData || []
      };
    },
    enabled: !!isAssignDriverOpen && !!selectedDriver, 
  });
  
  useEffect(() => {
    const driversSubscription = supabase
      .channel('drivers-management-drivers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => refetch())
      .subscribe();

    const assignmentsSubscription = supabase
      .channel('drivers-management-assignments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_assignments' }, () => refetch())
      .subscribe();

    let fleetSubscription: ReturnType<typeof supabase.channel> | null = null;
    let routesSubscription: ReturnType<typeof supabase.channel> | null = null;

    if (isAssignDriverOpen && selectedDriver) {
      fleetSubscription = supabase
        .channel('drivers-management-fleet-options-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'fleet' }, () => refetchAssignmentOptions())
        .subscribe();

      routesSubscription = supabase
        .channel('drivers-management-routes-options-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'routes' }, () => refetchAssignmentOptions())
        .subscribe();
    }
      
    return () => {
      supabase.removeChannel(driversSubscription);
      supabase.removeChannel(assignmentsSubscription);
      if (fleetSubscription) supabase.removeChannel(fleetSubscription);
      if (routesSubscription) supabase.removeChannel(routesSubscription);
    };
  }, [refetch, refetchAssignmentOptions, isAssignDriverOpen, selectedDriver]);
  
  const filteredDrivers = drivers?.filter(driver => {
    const matchesSearch = !searchTerm || 
      driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.license_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCurrentBranchName = () => {
    if (currentBranch === 'all') return 'All Branches';
    if (currentBranch && typeof currentBranch === 'object') return currentBranch.name;
    return 'Unknown Branch';
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never logged in';
    return new Date(lastLogin).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Drivers Management</h2>
          <p className="text-sm text-muted-foreground">
            {!isSuperAdmin && currentBranch && typeof currentBranch === 'object' && (
              `Showing drivers for ${currentBranch.name} branch`
            )}
            {isSuperAdmin && currentBranch === 'all' && (
              'Showing drivers for All Branches'
            )}
            {isSuperAdmin && currentBranch && typeof currentBranch === 'object' && (
              `Showing drivers for ${currentBranch.name} branch`
            )}
          </p>
        </div>
        <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <AddDriverForm 
              onSuccess={() => {
                setIsAddDriverOpen(false);
                refetch();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Debug info - remove in production */}
      <div className="text-sm text-gray-500">
        Total drivers loaded: {drivers?.length || 0}
      </div>
      
      {/* Drivers Table */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (!drivers || drivers.length === 0) ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">
            No drivers found for {getCurrentBranchName()}.
            {(isSuperAdmin || (currentBranch && typeof currentBranch === 'object')) && ' You can add a new driver using the button above.'}
          </p>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">
            No drivers match your search criteria for {getCurrentBranchName()}.
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                {isSuperAdmin && <TableHead>Branch</TableHead>}
                <TableHead>Contact</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Assignment</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver: Driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{driver.full_name}</span>
                      <span className="text-xs text-muted-foreground">{driver.email}</span>
                    </div>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      {driver.branches?.name || allBranches?.find(b => b.id === driver.branch_id)?.name || 'N/A'}
                    </TableCell>
                  )}
                  <TableCell>
                    <span className="text-sm">{driver.phone || 'N/A'}</span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{driver.license_number}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(driver.status)}>
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {driver.driver_assignments && driver.driver_assignments.length > 0 ? (
                      <div className="flex flex-col text-xs">
                        <span><Car className="h-3 w-3 inline-block mr-1" />{driver.driver_assignments[0].fleet?.name || 'No Bus'}</span>
                        <span className="text-muted-foreground ml-4">
                          {driver.driver_assignments[0].routes ? 
                            `${driver.driver_assignments[0].routes.from_location} → ${driver.driver_assignments[0].routes.to_location}` : 
                            'No Route'
                          }
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatLastLogin(driver.driver_auth?.[0]?.last_login || null)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedDriver(driver);
                          setIsAssignDriverOpen(true);
                        }}
                        disabled={isLoadingAssignmentOptions}
                      >
                        <Car className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                      <DriverActionsMenu 
                        driver={driver} 
                        onStatusUpdate={refetch}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Assign Driver Dialog */}
      {selectedDriver && (
        <Dialog open={isAssignDriverOpen} onOpenChange={setIsAssignDriverOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Driver: {selectedDriver.full_name}</DialogTitle>
              {selectedDriver.branch_id && allBranches?.find(b => b.id === selectedDriver.branch_id) && (
                <p className="text-sm text-muted-foreground">
                  Current Branch: {allBranches.find(b => b.id === selectedDriver.branch_id)?.name}
                </p>
              )}
               {!selectedDriver.branch_id && isSuperAdmin && (
                <p className="text-sm text-orange-500">
                  This driver is not yet assigned to a specific branch.
                </p>
              )}
            </DialogHeader>
            {isLoadingAssignmentOptions ? (
              <div className="flex justify-center items-center min-h-[150px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-2">Loading assignment options...</p>
              </div>
            ) : (
              <AssignDriverForm 
                driver={selectedDriver}
                fleetOptions={assignmentOptions?.fleetOptions || []} 
                routeOptions={assignmentOptions?.routeOptions || []}
                onSuccess={() => {
                  setIsAssignDriverOpen(false);
                  setSelectedDriver(null);
                  refetch();
                  refetchAssignmentOptions();
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DriversManagement;
