import { Switch, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

interface AddOnToggleProps {
  label:       string;
  description: string;
  price:       number;
  enabled:     boolean;
  onToggle:    (value: boolean) => void;
}

export function AddOnToggle({ label, description, price, enabled, onToggle }: AddOnToggleProps) {
  return (
    <View style={{
      flexDirection:   'row',
      alignItems:      'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[100],
    }}>
      {/* Left: label + description */}
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontWeight: '600', fontSize: 14, color: colors.gray[900] }}>{label}</Text>
        <Text style={{ fontSize: 12, color: colors.gray[500], marginTop: 2 }}>{description}</Text>
      </View>

      {/* Right: price + toggle */}
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text style={{ fontWeight: '700', fontSize: 14, color: enabled ? colors.brand[600] : colors.gray[500] }}>
          +฿{price.toLocaleString()}
        </Text>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.gray[200], true: colors.brand[500] }}
          thumbColor={enabled ? colors.white : colors.gray[400]}
        />
      </View>
    </View>
  );
}
