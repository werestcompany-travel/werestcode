import { type StyleProp, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?:   StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  const containerStyle: ViewStyle = {
    backgroundColor: colors.white,
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     colors.gray[100],
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.06,
    shadowRadius:    4,
    elevation:       2,
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[containerStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
}
