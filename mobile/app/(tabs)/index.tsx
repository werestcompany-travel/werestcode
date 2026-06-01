import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback, useRef } from 'react';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Prediction { place_id: string; description: string; }

function PlaceInput({ label, value, onSelect, accessibilityLabel: a11yLabel }: { label: string; value: string; onSelect: (desc: string) => void; accessibilityLabel?: string }) {
  const [query,    setQuery]    = useState(value);
  const [results,  setResults]  = useState<Prediction[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAutocomplete = useCallback(async (text: string) => {
    if (text.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await api.get('/api/search/places-autocomplete', { input: text });
      const data = await res.json() as { predictions: Prediction[] };
      setResults(data.predictions ?? []);
    } catch { setResults([]); }
    finally   { setLoading(false); }
  }, []);

  const search = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAutocomplete(text);
    }, 300);
  }, [fetchAutocomplete]);

  return (
    <View style={{ marginBottom: 12, zIndex: focused ? 10 : 1 }}>
      <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <TextInput
        value={query}
        onChangeText={search}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        placeholder={`Enter ${label.toLowerCase()}`}
        accessibilityLabel={a11yLabel ?? label}
        style={{ borderWidth: 1, borderColor: focused ? colors.brand[500] : colors.gray[200], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, backgroundColor: colors.white }}
      />
      {focused && (results.length > 0 || loading) && (
        <View style={{ position: 'absolute', top: 78, left: 0, right: 0, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.gray[100], shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, zIndex: 20 }}>
          {loading && <ActivityIndicator style={{ padding: 12 }} color={colors.brand[500]} />}
          {results.map((r) => (
            <TouchableOpacity key={r.place_id} onPress={() => { setQuery(r.description); setResults([]); onSelect(r.description); }} style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[100] }}>
              <Text style={{ fontSize: 14, color: colors.gray[900] }} numberOfLines={1}>{r.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [pickup,     setPickup]     = useState('');
  const [dropoff,    setDropoff]    = useState('');
  const [passengers, setPassengers] = useState(1);
  const [date,       setDate]       = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  function handleSearch() {
    if (!pickup || !dropoff) {
      Alert.alert('Missing details', 'Please enter both pickup and drop-off locations.');
      return;
    }
    router.push({
      pathname: '/booking/vehicles',
      params: { pickup, dropoff, passengers: String(passengers), date },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.brand[600] }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={{ padding: 24, paddingBottom: 0 }}>
          <Text style={{ color: colors.white, fontSize: 28, fontWeight: '900', lineHeight: 34 }}>Where to?</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>Private transfers across Thailand</Text>
        </View>

        {/* Search card */}
        <View style={{ margin: 16, backgroundColor: colors.white, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 }}>
          <PlaceInput label="Pickup"   value={pickup}  onSelect={setPickup}  accessibilityLabel="Pickup location" />
          <PlaceInput label="Drop-off" value={dropoff} onSelect={setDropoff} accessibilityLabel="Drop-off location" />

          {/* Date */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              style={{ borderWidth: 1, borderColor: colors.gray[200], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, backgroundColor: colors.white }}
            />
          </View>

          {/* Passengers */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Passengers</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity onPress={() => setPassengers(Math.max(1, passengers - 1))} style={{ width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[200], alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20, color: colors.gray[600] }}>−</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.gray[900], minWidth: 24, textAlign: 'center' }}>{passengers}</Text>
              <TouchableOpacity onPress={() => setPassengers(Math.min(10, passengers + 1))} style={{ width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[200], alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20, color: colors.gray[600] }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSearch}
            accessibilityLabel="Search for vehicles"
            accessibilityRole="button"
            style={{ backgroundColor: colors.brand[600], borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>Search Transfers</Text>
          </TouchableOpacity>
        </View>

        {/* Popular routes */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Popular routes</Text>
          {[
            { from: 'Suvarnabhumi Airport', to: 'Bangkok City Center' },
            { from: 'Bangkok',               to: 'Pattaya' },
            { from: 'Phuket Airport',        to: 'Patong Beach' },
          ].map((r) => (
            <TouchableOpacity
              key={r.from + r.to}
              onPress={() => { setPickup(r.from); setDropoff(r.to); }}
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ flex: 1, color: colors.white, fontSize: 14 }}>{r.from} → {r.to}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
