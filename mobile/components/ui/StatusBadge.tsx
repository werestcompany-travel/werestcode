import { Text, View } from 'react-native';
import type { BookingStatus } from '@/lib/types';

interface StatusConfig {
  bg:    string;
  text:  string;
  label: string;
}

const STATUS_MAP: Record<BookingStatus, StatusConfig> = {
  PENDING:          { bg: '#fffbeb', text: '#92400e', label: 'Pending' },
  DRIVER_CONFIRMED: { bg: '#eff6ff', text: '#1d4ed8', label: 'Confirmed' },
  DRIVER_STANDBY:   { bg: '#eef2ff', text: '#4338ca', label: 'Driver Ready' },
  DRIVER_PICKED_UP: { bg: '#f0fdf4', text: '#166534', label: 'En Route' },
  COMPLETED:        { bg: '#f3f4f6', text: '#374151', label: 'Completed' },
  CANCELLED:        { bg: '#fef2f2', text: '#991b1b', label: 'Cancelled' },
};

interface StatusBadgeProps {
  status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? { bg: '#f3f4f6', text: '#374151', label: status };

  return (
    <View style={{ backgroundColor: cfg.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: cfg.text }}>{cfg.label}</Text>
    </View>
  );
}
