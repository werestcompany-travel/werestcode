// ─── Enums ────────────────────────────────────────────────────────────────────

export type VehicleType = 'SEDAN' | 'SUV' | 'MINIVAN';

export type BookingStatus =
  | 'PENDING'
  | 'DRIVER_CONFIRMED'
  | 'DRIVER_STANDBY'
  | 'DRIVER_PICKED_UP'
  | 'COMPLETED'
  | 'CANCELLED';

export type TabType = 'private-ride' | 'tours' | 'tickets';

// ─── Search ───────────────────────────────────────────────────────────────────

export interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface PrivateRideSearch {
  pickup: PlaceResult;
  dropoff: PlaceResult;
  date: string;        // ISO date string
  time: string;        // "HH:mm"
  passengers: number;
  luggage: number;
}

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  polyline: string;    // encoded polyline
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface PricingRule {
  id: string;
  vehicleType: VehicleType;
  name: string;
  description: string;
  maxPassengers: number;
  maxLuggage: number;
  baseFare: number;
  pricePerKm: number;
  imageUrl?: string | null;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  icon?: string | null;
}

export interface SelectedAddOn {
  addOnId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface BookingFormData {
  // Route
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  durationMin: number;
  // Schedule
  pickupDate: string;
  pickupTime: string;
  // Passengers
  passengers: number;
  luggage: number;
  // Vehicle
  vehicleType: VehicleType;
  // Add-ons
  selectedAddOns: SelectedAddOn[];
  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialNotes?: string;
  // Pricing
  basePrice: number;
  addOnsTotal: number;
  totalPrice: number;
}

export interface BookingStatusHistory {
  id: string;
  status: BookingStatus;
  note?: string | null;
  updatedBy?: string | null;
  createdAt: string;
}

export interface BookingDetail {
  id: string;
  bookingRef: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  durationMin: number;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  vehicleType: VehicleType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialNotes?: string | null;
  basePrice: number;
  addOnsTotal: number;
  totalPrice: number;
  currentStatus: BookingStatus;
  statusHistory: BookingStatusHistory[];
  bookingAddOns: {
    addOn: { name: string; icon?: string | null };
    quantity: number;
    unitPrice: number;
  }[];
  createdAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminBookingRow {
  id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  vehicleType: VehicleType;
  totalPrice: number;
  currentStatus: BookingStatus;
  createdAt: string;
}
