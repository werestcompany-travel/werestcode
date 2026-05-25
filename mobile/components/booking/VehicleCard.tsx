import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/theme';
import type { VehicleType } from '@/lib/types';

const VEHICLE_EMOJI: Record<VehicleType, string> = {
  SEDAN:      '🚗',
  SUV:        '🚙',
  MINIVAN:    '🚐',
  LUXURY_MPV: '✨',
};

interface VehicleCardProps {
  vehicle:      VehicleType;
  price:        number;
  priceChild?:  number;
  description?: string;
  capacity:     string;
  selected:     boolean;
  onPress:      () => void;
}

export function VehicleCard({ vehicle, price, priceChild, description, capacity, selected, onPress }: VehicleCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.white,
        borderRadius:    16,
        padding:         16,
        marginBottom:    12,
        borderWidth:     selected ? 2 : 1,
        borderColor:     selected ? colors.brand[500] : colors.gray[100],
        shadowColor:     '#000',
        shadowOffset:    { width: 0, height: 1 },
        shadowOpacity:   0.05,
        shadowRadius:    3,
        elevation:       selected ? 3 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Emoji / icon */}
        <View style={{
          width:           52,
          height:          52,
          borderRadius:    12,
          backgroundColor: selected ? colors.brand[50] : colors.gray[50],
          alignItems:      'center',
          justifyContent:  'center',
        }}>
          <Text style={{ fontSize: 28 }}>{VEHICLE_EMOJI[vehicle]}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: colors.gray[900] }}>{vehicle.replace('_', ' ')}</Text>
          <Text style={{ fontSize: 12, color: colors.gray[500], marginTop: 2 }}>{capacity}</Text>
          {description && (
            <Text style={{ fontSize: 12, color: colors.gray[400], marginTop: 2 }} numberOfLines={1}>{description}</Text>
          )}
        </View>

        {/* Price + checkmark */}
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ fontWeight: '800', fontSize: 16, color: colors.brand[600] }}>
            {'฿' + price.toLocaleString()}
          </Text>
          {priceChild !== undefined && (
            <Text style={{ fontSize: 11, color: colors.gray[400] }}>Child ฿{priceChild.toLocaleString()}</Text>
          )}
          {selected && (
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.brand[500], alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>✓</Text>
            </View>
          )}
        </View>
      </View>

      {/* "From ฿X,XXX" label at bottom when not selected */}
      {!selected && (
        <Text style={{ fontSize: 11, color: colors.gray[400], marginTop: 10 }}>
          From ฿{price.toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}
