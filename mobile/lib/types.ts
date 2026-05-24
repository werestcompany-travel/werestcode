export type BookingStatus =
  | 'PENDING' | 'DRIVER_CONFIRMED' | 'DRIVER_STANDBY'
  | 'DRIVER_PICKED_UP' | 'COMPLETED' | 'CANCELLED';

export type VehicleType = 'SEDAN' | 'SUV' | 'MINIVAN' | 'LUXURY_MPV';

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  SEDAN:      'Sedan (up to 2 pax)',
  SUV:        'SUV (up to 4 pax)',
  MINIVAN:    'Minivan (up to 10 pax)',
  LUXURY_MPV: 'Luxury MPV (up to 6 pax)',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING:          'Pending',
  DRIVER_CONFIRMED: 'Driver Confirmed',
  DRIVER_STANDBY:   'Driver On the Way',
  DRIVER_PICKED_UP: 'Picked Up',
  COMPLETED:        'Completed',
  CANCELLED:        'Cancelled',
};

export interface User {
  id:            string;
  email:         string;
  name:          string;
  phone?:        string;
  loyaltyPoints: number;
  tierLevel:     'EXPLORER' | 'ADVENTURER' | 'NAVIGATOR' | 'VOYAGER';
}

export interface BookingListItem {
  id:          string;
  bookingRef:  string;
  serviceType: 'transfer' | 'tour' | 'attraction';
  serviceName: string;
  date:        string;
  status:      BookingStatus;
  price:       number;
  viewUrl?:    string;
}

export interface BookingDetail {
  id:             string;
  bookingRef:     string;
  pickupAddress:  string;
  dropoffAddress: string;
  pickupDate:     string;
  pickupTime:     string;
  passengers:     number;
  luggage:        number;
  vehicleType:    VehicleType;
  totalPrice:     number;
  currentStatus:  BookingStatus;
  driverName?:    string;
  customerName:   string;
  customerEmail:  string;
  customerPhone:  string;
}

export interface DriverLocation {
  available:  boolean;
  lat?:       number;
  lng?:       number;
  heading?:   number;
  updatedAt?: string;
}

export interface PricingResult {
  vehicleType:   VehicleType;
  basePrice:     number;
  totalPrice:    number;
  distanceKm:    number;
  durationMin:   number;
}
