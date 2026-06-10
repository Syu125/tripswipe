import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeCard from '../components/SwipeCard';
import AddCardSheet from '../components/AddCardSheet';
import { useTripCards } from '../hooks/useCards';
import { getColors, radius, spacing, font } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
type Tab = 'deck' | 'archive';

export default function DeckScreen() {
  const { tripId, tripName } = useLocalSearchParams<{ tripId: string; tripName: string }>();
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const router = useRouter();

  const { cards, archived, loading, addCard, markDone, skipCard, restoreCard, deleteCard, parsePaste } = useTripCards(tripId);
  const [tab, setTab] = useState<Tab>('deck');
  const [addVisible, setAddVisible] = useState(false);

  const s = makeStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: colors.bgTertiary, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const topThree = cards.slice(0, 3);

  const confirmDelete = (cardId: string, name: string) => {
    Alert.alert('Remove stop', `Remove "${name}" from your archive?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteCard(cardId) },
    ]);
  };

  return (
    <GestureHandlerRootView style={s.flex}>
      <SafeAreaView style={[s.flex, { backgroundColor: colors.bgTertiary }]}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={[s.backText, { color: colors.info }]}>← Trips</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={[s.headerTitle, { color: colors.text }]}>{tripName}</Text>
            <Text style={[s.headerSub, { color: colors.textSecondary }]}>
              {cards.length} left · {archived.length} done
            </Text>
          </View>
          <TouchableOpacity style={[s.addBtn, { borderColor: colors.border, backgroundColor: colors.bg }]} onPress={() => setAddVisible(true)}>
            <Text style={[{ color: colors.info, fontSize: 22, lineHeight: 26 }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Tab bar */}
        <View style={[s.tabBar, { borderColor: colors.border }]}>
          {(['deck', 'archive'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.tabBtn, tab === t && { backgroundColor: colors.bgTertiary }]}
              onPress={() => setTab(t)}
            >
              <Text style={[s.tabText, { color: tab === t ? colors.text : colors.textSecondary }]}>
                {t === 'deck' ? 'Up next' : `Done (${archived.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Deck view */}
        {tab === 'deck' && (
          <View style={s.flex}>
            <View style={s.stackArea}>
              {cards.length === 0 ? (
                <View style={[s.emptyCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={{ fontSize: 40 }}>🎉</Text>
                  <Text style={[s.emptyTitle, { color: colors.text }]}>All done!</Text>
                  <Text style={[s.emptyHint, { color: colors.textSecondary }]}>
                    Check the Done tab or add more stops.
                  </Text>
                </View>
              ) : (
                topThree.map((card, i) => (
                  <SwipeCard
                    key={card.id}
                    card={card}
                    isTop={i === 0}
                    stackIndex={i}
                    onDone={() => markDone(card.id)}
                    onSkip={() => skipCard(card.id)}
                  />
                ))
              )}
            </View>

            {cards.length > 0 && (
              <>
                <Text style={[s.swipeHint, { color: colors.textTertiary }]}>
                  ← skip &nbsp;&nbsp; swipe &nbsp;&nbsp; done →
                </Text>
                <View style={s.actionRow}>
                  <TouchableOpacity
                    style={[s.actionBtn, { borderColor: colors.border, backgroundColor: colors.bg }]}
                    onPress={() => skipCard(cards[0].id)}
                    accessibilityLabel="Skip for now"
                  >
                    <Text style={{ fontSize: 22 }}>⏭</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.actionBtn, s.doneBtn, { borderColor: colors.success, backgroundColor: colors.successBg }]}
                    onPress={() => markDone(cards[0].id)}
                    accessibilityLabel="Mark as done"
                  >
                    <Text style={{ fontSize: 22 }}>✓</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {/* Archive view */}
        {tab === 'archive' && (
          <ScrollView contentContainerStyle={s.archiveList}>
            {archived.length === 0 ? (
              <View style={s.archiveEmpty}>
                <Text style={{ fontSize: 32 }}>📦</Text>
                <Text style={[s.emptyHint, { color: colors.textSecondary }]}>Completed stops appear here</Text>
              </View>
            ) : (
              archived.map((card) => (
                <View key={card.id} style={[s.archiveCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={{ fontSize: 26 }}>{card.emoji}</Text>
                  <View style={s.archiveInfo}>
                    <Text style={[s.archiveName, { color: colors.text }]}>{card.name}</Text>
                    {!!card.time && <Text style={[s.archiveTime, { color: colors.textSecondary }]}>{card.time}</Text>}
                  </View>
                  <TouchableOpacity
                    style={[s.restoreBtn, { borderColor: colors.border }]}
                    onPress={() => restoreCard(card.id)}
                  >
                    <Text style={[s.restoreText, { color: colors.textSecondary }]}>Restore</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.restoreBtn, { borderColor: colors.border, marginLeft: spacing.sm }]}
                    onPress={() => confirmDelete(card.id, card.name)}
                  >
                    <Text style={[s.restoreText, { color: colors.danger }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        )}

        <AddCardSheet
          visible={addVisible}
          onClose={() => setAddVisible(false)}
          onAdd={addCard}
          onPaste={parsePaste}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const makeStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: font.semibold },
  headerSub: { fontSize: 12, marginTop: 2 },
  backBtn: { padding: spacing.sm },
  backText: { fontSize: 15 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderWidth: 0.5,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: font.medium },
  stackArea: {
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
  },
  emptyCard: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: 280,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyTitle: { fontSize: 20, fontWeight: font.semibold },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  swipeHint: { textAlign: 'center', fontSize: 12, marginTop: spacing.lg, marginBottom: spacing.md },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtn: { borderWidth: 1.5 },
  archiveList: { padding: spacing.lg, gap: spacing.md },
  archiveEmpty: { alignItems: 'center', marginTop: 60, gap: spacing.md },
  archiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 0.5,
  },
  archiveInfo: { flex: 1 },
  archiveName: { fontSize: 14, fontWeight: font.medium },
  archiveTime: { fontSize: 12, marginTop: 2 },
  restoreBtn: {
    borderWidth: 0.5,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  restoreText: { fontSize: 12 },
});
