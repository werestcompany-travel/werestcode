import { View, Text, StyleSheet } from 'react-native';

interface Props { icon?: string; title: string; subtitle?: string; }

export default function EmptyState({ icon = '📭', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  icon:      { fontSize: 48, marginBottom: 16 },
  title:     { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle:  { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingHorizontal: 32 },
});
