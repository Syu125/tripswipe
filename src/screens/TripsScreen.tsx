import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTrips } from '../hooks/useCards';
import { getColors, radius, spacing, font } from '../theme';

export default function TripsScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const router = useRouter();
  const { trips, loading, addTrip, removeTrip } = useTrips();

  const [modalVisible, setModalVisible] = useState(false);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');

  const s = makeStyles(colors);

  const handleCreate = async () => {
    if (!tripName.trim()) { Alert.alert('Name required'); return; }
    const trip = await addTrip(tripName.trim(), destination.trim());
    setTripName('');
    setDestination('');
    setModalVisible(false);
    router.push({ pathname: '/deck', params: { tripId: trip.id, tripName: trip.name } });
  };

  const confirmDelete = (tripId: string, name: string) => {
    Alert.alert('Delete trip', `Delete "${name}" and all its cards?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeTrip(tripId) },
    ]);
  };

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: colors.bgTertiary }]}>
      <View style={s.header}>
        <Text style={[s.title, { color: colors.text }]}>TripSwipe</Text>
        <Text style={[s.subtitle, { color: colors.textSecondary }]}>Your trips</Text>
      </View>

      <ScrollView contentContainerStyle={s.list}>
        {!loading && trips.length === 0 && (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>✈️</Text>
            <Text style={[s.emptyTitle, { color: colors.text }]}>No trips yet</Text>
            <Text style={[s.emptyHint, { color: colors.textSecondary }]}>
              Create your first trip to start building your itinerary.
            </Text>
          </View>
        )}

        {trips.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            style={[s.card, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={() => router.push({ pathname: '/deck', params: { tripId: trip.id, tripName: trip.name } })}
            activeOpacity={0.75}
          >
            <View style={s.cardContent}>
              <Text style={[s.cardName, { color: colors.text }]}>{trip.name}</Text>
              {!!trip.destination && (
                <Text style={[s.cardDest, { color: colors.textSecondary }]}>📍 {trip.destination}</Text>
              )}
              <Text style={[s.cardDate, { color: colors.textTertiary }]}>
                {new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <TouchableOpacity
              style={s.deleteBtn}
              onPress={() => confirmDelete(trip.id, trip.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ color: colors.textTertiary, fontSize: 18 }}>⋯</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.fab}>
        <TouchableOpacity
          style={[s.fabBtn, { backgroundColor: colors.bg, borderColor: colors.borderStrong }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[s.fabText, { color: colors.text }]}>+ New trip</Text>
        </TouchableOpacity>
      </View>

      {/* New trip modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={[s.modal, { backgroundColor: colors.bg }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: colors.text }]}>New trip</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setTripName(''); setDestination(''); }}>
                <Text style={[{ color: colors.textSecondary, fontSize: 15 }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={s.modalBody}>
              <Text style={[s.label, { color: colors.textSecondary }]}>Trip name *</Text>
              <TextInput
                style={[s.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bgSecondary }]}
                placeholder="e.g. Seattle Weekend"
                placeholderTextColor={colors.textTertiary}
                value={tripName}
                onChangeText={setTripName}
                autoFocus
              />

              <Text style={[s.label, { color: colors.textSecondary }]}>Destination</Text>
              <TextInput
                style={[s.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bgSecondary }]}
                placeholder="e.g. Seattle, WA"
                placeholderTextColor={colors.textTertiary}
                value={destination}
                onChangeText={setDestination}
              />

              <TouchableOpacity style={[s.createBtn, { borderColor: colors.borderStrong }]} onPress={handleCreate}>
                <Text style={[s.createText, { color: colors.text }]}>Create trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  flex: { flex: 1 },
  header: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  title: { fontSize: 28, fontWeight: font.semibold },
  subtitle: { fontSize: 14, marginTop: 2 },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: 80, gap: spacing.md, padding: spacing.xl },
  emptyTitle: { fontSize: 20, fontWeight: font.semibold },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 0.5,
  },
  cardContent: { flex: 1, gap: 3 },
  cardName: { fontSize: 17, fontWeight: font.medium },
  cardDest: { fontSize: 13 },
  cardDate: { fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: spacing.sm },
  fab: { position: 'absolute', bottom: spacing.xl, left: spacing.lg, right: spacing.lg },
  fabBtn: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  fabText: { fontSize: 15, fontWeight: font.medium },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  modalTitle: { fontSize: 18, fontWeight: font.semibold },
  modalBody: { padding: spacing.lg, gap: spacing.sm },
  label: { fontSize: 12, fontWeight: font.medium, marginTop: spacing.md },
  input: {
    borderWidth: 0.5,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    marginTop: 4,
  },
  createBtn: {
    borderWidth: 0.5,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  createText: { fontSize: 15, fontWeight: font.medium },
});
