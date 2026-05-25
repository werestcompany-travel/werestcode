import { useState } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors } from '@/constants/theme';

interface InputProps {
  label?:           string;
  value:            string;
  onChangeText:     (text: string) => void;
  placeholder?:     string;
  error?:           string;
  secureTextEntry?: boolean;
  keyboardType?:    TextInputProps['keyboardType'];
  autoCapitalize?:  TextInputProps['autoCapitalize'];
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType    = 'default',
  autoCapitalize  = 'sentences',
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.red[500]
    : focused
    ? colors.brand[500]
    : colors.gray[200];

  return (
    <View style={{ gap: 4 }}>
      {label && (
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.gray[700] }}>{label}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          borderWidth:      1,
          borderColor,
          borderRadius:     10,
          paddingHorizontal: 14,
          paddingVertical:   12,
          fontSize:          14,
          color:             colors.gray[900],
          backgroundColor:   colors.gray[50],
        }}
      />
      {error && (
        <Text style={{ fontSize: 12, color: colors.red[500] }}>{error}</Text>
      )}
    </View>
  );
}
