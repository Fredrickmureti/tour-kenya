
import { Route } from '../types/bookingTypes';

export const calculateTotalPrice = (
  route: Route | undefined,
  fleetPriceMultiplier: number,
  seatCount: number
): number => {
  if (!route) return 0;
  return route.price * fleetPriceMultiplier * seatCount;
};

export const getTargetBranchId = (route: Route | undefined, branches: any[]): string => {
  return route?.branch_id || branches?.[0]?.id;
};
