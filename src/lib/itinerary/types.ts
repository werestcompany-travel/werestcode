export type HotelCategory = 'budget' | 'standard' | 'superior' | 'deluxe' | 'luxury';
export type ActivityType =
  | 'transfer'
  | 'tour'
  | 'attraction'
  | 'meal'
  | 'free-time'
  | 'check-in'
  | 'check-out'
  | 'flight'
  | 'hotel';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type ItineraryLanguage = 'en' | 'th' | 'zh';
export type ItineraryStatus = 'draft' | 'finalized' | 'sent';

export interface ItineraryActivity {
  id: string;
  time?: string;
  title: string;
  description: string;
  type: ActivityType;
  duration?: string;
  price?: number;
  notes?: string;
  tourSlug?: string;
  attractionSlug?: string;
  emoji?: string;
}

export interface ItineraryDayBlock {
  day: number;
  date?: string;
  title: string;
  description: string;
  activities: ItineraryActivity[];
  accommodation?: string;
  meals: MealType[];
  transferInfo?: string;
}

export interface PricingLine {
  id: string;
  label: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'transfer' | 'tour' | 'attraction' | 'hotel' | 'guide' | 'meals' | 'other';
}

export interface ItineraryFormData {
  destination: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  travelers: number;
  hotelCategory: HotelCategory;
  language: ItineraryLanguage;
  clientName?: string;
  clientEmail?: string;
  activityPreferences: string[];
  budget?: string;
  specialRequests?: string;
  presetId?: string;
  title?: string;
}

export interface ItineraryRecord {
  id: string;
  ref: string;
  title: string;
  subtitle?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  destination: string;
  destinations: string[];
  startDate?: string | null;
  endDate?: string | null;
  travelers: number;
  hotelCategory: string;
  language: string;
  status: string;
  overview?: string | null;
  highlights: string[];
  dayBlocks: ItineraryDayBlock[];
  inclusions: string[];
  exclusions: string[];
  terms?: string | null;
  importantNotes?: string | null;
  pricingLines: PricingLine[];
  totalPrice?: number | null;
  currency: string;
  presetId?: string | null;
  adminNotes?: string | null;
  exportedAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryPresetRecord {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  destinations: string[];
  days: number;
  thumbnail?: string | null;
  dayBlocks: ItineraryDayBlock[];
  inclusions: string[];
  exclusions: string[];
  terms?: string | null;
  tags: string[];
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const HOTEL_CATEGORIES: Record<HotelCategory, { label: string; pricePerNight: number; stars: number }> = {
  budget:   { label: 'Budget / Hostel',  pricePerNight: 800,   stars: 2 },
  standard: { label: '3-Star Hotel',     pricePerNight: 2000,  stars: 3 },
  superior: { label: '4-Star Hotel',     pricePerNight: 4000,  stars: 4 },
  deluxe:   { label: '5-Star Hotel',     pricePerNight: 8000,  stars: 5 },
  luxury:   { label: 'Luxury / Villa',   pricePerNight: 15000, stars: 5 },
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  transfer:    '🚗',
  tour:        '🗺️',
  attraction:  '🎡',
  meal:        '🍽️',
  'free-time': '🌴',
  'check-in':  '🏨',
  'check-out': '🧳',
  flight:      '✈️',
  hotel:       '🛎️',
};

export const LANGUAGES: Record<ItineraryLanguage, { label: string; flag: string }> = {
  en: { label: 'English',  flag: '🇬🇧' },
  th: { label: 'ภาษาไทย', flag: '🇹🇭' },
  zh: { label: '中文',    flag: '🇨🇳' },
};

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'transfer',   label: 'Transfer / Transport' },
  { value: 'tour',       label: 'Tour / Activity' },
  { value: 'attraction', label: 'Attraction / Ticket' },
  { value: 'meal',       label: 'Meal / Dining' },
  { value: 'free-time',  label: 'Free Time / Leisure' },
  { value: 'check-in',   label: 'Hotel Check-in' },
  { value: 'check-out',  label: 'Hotel Check-out' },
  { value: 'flight',     label: 'Flight / Arrival' },
  { value: 'hotel',      label: 'Hotel / Accommodation' },
];

export const PRESET_CATEGORIES = [
  { value: 'adventure',  label: 'Adventure',    emoji: '🏔️' },
  { value: 'cultural',   label: 'Cultural',     emoji: '🏛️' },
  { value: 'beach',      label: 'Beach',        emoji: '🏖️' },
  { value: 'family',     label: 'Family',       emoji: '👨‍👩‍👧‍👦' },
  { value: 'honeymoon',  label: 'Honeymoon',    emoji: '💑' },
  { value: 'luxury',     label: 'Luxury',       emoji: '✨' },
  { value: 'budget',     label: 'Budget',       emoji: '💰' },
  { value: 'general',    label: 'General',      emoji: '🌍' },
];

export function generateItineraryRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'WRI-';
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

export function calcNights(start: string | Date | null | undefined, end: string | Date | null | undefined): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}

export function calcTotalPrice(lines: PricingLine[]): number {
  return lines.reduce((sum, l) => sum + l.total, 0);
}
