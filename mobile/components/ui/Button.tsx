import { ActivityIndicator, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { colors } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label:     string;
  onPress:   () => void;
  variant?:  Variant;
  loading?:  boolean;
  disabled?: boolean;
  icon?:     React.ReactNode;
}

const VARIANT_STYLES: Record<Variant, { container: TouchableOpacityProps['style']; text: object }> = {
  primary: {
    container: { backgroundColor: colors.brand[500], borderWidth: 0 },
    text:      { color: colors.white },
  },
  secondary: {
    container: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.brand[500] },
    text:      { color: colors.brand[500] },
  },
  ghost: {
    container: { backgroundColor: 'transparent', borderWidth: 0 },
    text:      { color: colors.brand[500] },
  },
  danger: {
    container: { backgroundColor: colors.red[600], borderWidth: 0 },
    text:      { color: colors.white },
  },
};

export function Button({ label, onPress, variant = 'primary', loading = false, disabled = false, icon }: ButtonProps) {
  const vs      = VARIANT_STYLES[variant];
  const opacity = loading || disabled ? 0.6 : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.75}
      style={[
        {
          flexDirection:  'row',
          alignItems:     'center',
          justifyContent: 'center',
          borderRadius:   14,
          paddingVertical: 15,
          paddingHorizontal: 24,
          gap: 8,
          opacity,
        },
        vs.container,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.brand[500]} />
      ) : (
        <>
          {icon}
          <Text style={[{ fontWeight: '700', fontSize: 15 }, vs.text]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
