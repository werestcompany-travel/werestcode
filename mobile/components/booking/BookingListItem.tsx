import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/theme';
import type { BookingListItem as BookingListItemType } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { BookingStatus } from '@/lib/types';

interface BookingListItemProps {
  booking: BookingListItemType;
  onPress: () => void;
}

export function BookingListItem({ booking, onPress }: BookingListItemProps) {
  const formattedDate = (() => {
    try {
      return new Date(booking.date).toLocaleDateString('en-GB', {
        day:   'numeric',
        month: 'short',
        year:  'numeric',
      });
    } catch {
      return booking.date;
    }
  })();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.white,
        borderRadius:    16,
        padding:         16,
        marginBottom:    12,
        borderWidth:     1,
        borderColor:     colors.gray[100],
        flexDirection:   'row',
        alignItems:      'center',
        gap:             12,
      }}
    >
      {/* Main content */}
      <View style={{ flex: 1 }}>
        {/* Ref + badge row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.gray[900] }}>{booking.bookingRef}</Text>
          <StatusBadge status={booking.status as BookingStatus} />
        </View>

        {/* Service name */}
        <Text style={{ fontSize: 13, color: colors.gray[600], marginBottom: 4 }} numberOfLines={1}>
          {booking.serviceName}
        </Text>

        {/* Date + price row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.gray[400] }}>{formattedDate}</Text>
          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.brand[600] }}>
            ฿{booking.price.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <Text style={{ fontSize: 16, color: colors.gray[400] }}>›</Text>
    </TouchableOpacity>
  );
}
