import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { TripCard } from '../types';
import { EMOJIS, getColors, radius, spacing, font } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (card: Omit<TripCard, 'id' | 'tripId'>) => void;
  onPaste: (text: string) => void;
}

type Mode = 'manual' | 'paste';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateForInput(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string): Date | null {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, monthIndex, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== monthIndex ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export default function AddCardSheet({ visible, onClose, onAdd, onPaste }: Props) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const [mode, setMode] = useState<Mode>('manual');
  const [emoji, setEmoji] = useState('📍');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const selectedDate = useMemo(() => parseInputDate(date), [date]);
  const monthLabel = useMemo(
    () => calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    [calendarMonth]
  );
  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = [];

    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [calendarMonth]);

  const reset = () => {
    setCalendarVisible(false);
    setEmoji('📍'); setName(''); setDate(''); setAddress(''); setTime(''); setLink(''); setNotes(''); setPasteText('');
  };

  const openCalendar = () => {
    const base = selectedDate ?? new Date();
    setCalendarMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setCalendarVisible(true);
  };

  const moveCalendarMonth = (offset: number) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const pickCalendarDate = (day: number) => {
    const selected = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    setDate(formatDateForInput(selected));
    setCalendarVisible(false);
  };

  const handleAdd = () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter a place name.'); return; }
    if (!date.trim()) { Alert.alert('Date required', 'Please enter the event day (e.g. 2026-06-14).'); return; }
    onAdd({
      emoji,
      name: name.trim(),
      date: date.trim(),
      address: address.trim(),
      time: time.trim(),
      link: link.trim(),
      notes: notes.trim(),
    });
    reset();
    onClose();
  };

  const handlePaste = () => {
    if (!pasteText.trim()) { Alert.alert('Nothing to parse', 'Paste your list first.'); return; }
    onPaste(pasteText);
    reset();
    onClose();
  };

  const s = makeStyles(colors);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[s.container, { backgroundColor: colors.bg }]}>
          {/* Header */}
          <View style={s.header}>
            <Text style={[s.title, { color: colors.text }]}>Add stop</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }} style={s.closeBtn}>
              <Text style={[s.closeText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Mode toggle */}
          <View style={[s.modeRow, { borderColor: colors.border }]}>
            {(['manual', 'paste'] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[s.modeBtn, mode === m && { backgroundColor: colors.bgTertiary }]}
                onPress={() => setMode(m)}
              >
                <Text style={[s.modeBtnText, { color: mode === m ? colors.text : colors.textSecondary }]}>
                  {m === 'manual' ? 'Manual' : 'Paste list'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
            {mode === 'manual' ? (
              <>
                {/* Emoji picker */}
                <Text style={[s.label, { color: colors.textSecondary }]}>Icon</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.emojiScroll}>
                  {EMOJIS.map((e) => (
                    <TouchableOpacity
                      key={e}
                      style={[
                        s.emojiBtn,
                        { borderColor: colors.border, backgroundColor: colors.bgSecondary },
                        emoji === e && { borderColor: colors.info, backgroundColor: colors.infoBg, borderWidth: 1.5 },
                      ]}
                      onPress={() => setEmoji(e)}
                    >
                      <Text style={{ fontSize: 22 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[s.label, { color: colors.textSecondary }]}>Place name *</Text>
                <TextInput
                  style={[s.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bgSecondary }]}
                  placeholder="e.g. Pike Place Market"
                  placeholderTextColor={colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                />

                <Text style={[s.label, { color: colors.textSecondary }]}>Date *</Text>
                <TextInput
                  style={[s.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bgSecondary }]}
                  placeholder="e.g. 2026-06-14"
                  placeholderTextColor={colors.textTertiary}
                  value={date}
                  onChangeText={setDate}
                />
                <TouchableOpacity
                  style={[s.calendarTrigger, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}
                  onPress={openCalendar}
                >
                  <Text style={[s.calendarTriggerText, { color: colors.textSecondary }]}>Open calendar</Text>
                </TouchableOpacity>

                <Text style={[s.label, { color: colors.textSecondary }]}>Address</Text>
                <TextInput
                  style={[s.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bgSecondary }]}
                  placeholder="e.g. 85 Pike St, Seattle, WA"
                  placeholderTextColor={colors.textTertiary}
                  value={address}
                  onChangeText={setAddress}
                />

                <Text style={[s.label, { color: colors.textSecondary }]}>Time / schedule</Text>
                <TextInput
                  style={[s.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bgSecondary }]}
                  placeholder="e.g. 10:00 AM – 12:00 PM"
                  placeholderTextColor={colors.textTertiary}
                  value={time}
                  onChangeText={setTime}
                />

                <Text style={[s.label, { color: colors.textSecondary }]}>Google Maps link</Text>
                <TextInput
                  style={[s.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bgSecondary }]}
                  placeholder="https://maps.google.com/..."
                  placeholderTextColor={colors.textTertiary}
                  value={link}
                  onChangeText={setLink}
                  autoCapitalize="none"
                  keyboardType="url"
                />

                <Text style={[s.label, { color: colors.textSecondary }]}>Details / notes</Text>
                <TextInput
                  style={[s.textarea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bgSecondary }]}
                  placeholder="Anything helpful: reservation info, budget, must-try items..."
                  placeholderTextColor={colors.textTertiary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  textAlignVertical="top"
                />

                <TouchableOpacity style={[s.submitBtn, { borderColor: colors.borderStrong }]} onPress={handleAdd}>
                  <Text style={[s.submitText, { color: colors.text }]}>Add card</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[s.label, { color: colors.textSecondary }]}>One stop per line</Text>
                <Text style={[s.hint, { color: colors.textTertiary }]}>
                  Format: Place, Date, Time, Google Maps Link, Notes{'\n'}
                  e.g. Space Needle, 2026-06-14, 1:00 PM, https://maps.google.com/..., Sunset view first
                </Text>
                <TextInput
                  style={[s.textarea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bgSecondary }]}
                  placeholder={'Pike Place Market, 2026-06-14, 10:00 AM, https://maps.google.com/..., Grab chowder\nSpace Needle, 2026-06-15, 1:00 PM, https://maps.google.com/..., Buy tickets early'}
                  placeholderTextColor={colors.textTertiary}
                  value={pasteText}
                  onChangeText={setPasteText}
                  multiline
                  textAlignVertical="top"
                />
                <TouchableOpacity style={[s.submitBtn, { borderColor: colors.borderStrong }]} onPress={handlePaste}>
                  <Text style={[s.submitText, { color: colors.text }]}>Parse & add cards</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <Modal
            visible={calendarVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setCalendarVisible(false)}
          >
            <View style={s.calendarOverlay}>
              <View style={[s.calendarCard, { backgroundColor: colors.bg, borderColor: colors.border }]}> 
                <View style={s.calendarHeader}>
                  <TouchableOpacity
                    style={[s.calendarNavBtn, { borderColor: colors.border }]}
                    onPress={() => moveCalendarMonth(-1)}
                  >
                    <Text style={[s.calendarNavText, { color: colors.text }]}>‹</Text>
                  </TouchableOpacity>
                  <Text style={[s.calendarMonthTitle, { color: colors.text }]}>{monthLabel}</Text>
                  <TouchableOpacity
                    style={[s.calendarNavBtn, { borderColor: colors.border }]}
                    onPress={() => moveCalendarMonth(1)}
                  >
                    <Text style={[s.calendarNavText, { color: colors.text }]}>›</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.weekdayRow}>
                  {WEEKDAY_LABELS.map((label) => (
                    <Text key={label} style={[s.weekdayText, { color: colors.textTertiary }]}> 
                      {label}
                    </Text>
                  ))}
                </View>

                <View style={s.calendarGrid}>
                  {calendarCells.map((day, index) => {
                    if (!day) {
                      return <View key={`empty-${index}`} style={s.dayCell} />;
                    }

                    const isSelected = !!selectedDate
                      && selectedDate.getFullYear() === calendarMonth.getFullYear()
                      && selectedDate.getMonth() === calendarMonth.getMonth()
                      && selectedDate.getDate() === day;

                    return (
                      <View key={`day-${day}`} style={s.dayCell}>
                        <TouchableOpacity
                          style={[
                            s.dayBtn,
                            { borderColor: colors.border },
                            isSelected && { backgroundColor: colors.infoBg, borderColor: colors.info },
                          ]}
                          onPress={() => pickCalendarDate(day)}
                        >
                          <Text
                            style={[
                              s.dayText,
                              { color: colors.text },
                              isSelected && { color: colors.info },
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[s.calendarCloseBtn, { borderColor: colors.borderStrong }]}
                  onPress={() => setCalendarVisible(false)}
                >
                  <Text style={[s.calendarCloseText, { color: colors.text }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: { fontSize: 18, fontWeight: font.semibold },
  closeBtn: { padding: spacing.sm },
  closeText: { fontSize: 15 },
  modeRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderWidth: 0.5,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  modeBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  modeBtnText: { fontSize: 13, fontWeight: font.medium },
  body: { paddingHorizontal: spacing.lg, paddingBottom: 40, gap: spacing.sm },
  label: { fontSize: 12, fontWeight: font.medium, marginTop: spacing.md },
  hint: { fontSize: 12, lineHeight: 18 },
  emojiScroll: { flexDirection: 'row', marginVertical: spacing.sm },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  input: {
    borderWidth: 0.5,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    marginTop: 4,
  },
  calendarTrigger: {
    borderWidth: 0.5,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  calendarTriggerText: { fontSize: 13, fontWeight: font.medium },
  textarea: {
    borderWidth: 0.5,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    marginTop: 4,
    height: 160,
  },
  submitBtn: {
    borderWidth: 0.5,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitText: { fontSize: 15, fontWeight: font.medium },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  calendarCard: {
    borderWidth: 0.5,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderWidth: 0.5,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavText: { fontSize: 20, lineHeight: 22 },
  calendarMonthTitle: { fontSize: 15, fontWeight: font.semibold },
  weekdayRow: { flexDirection: 'row' },
  weekdayText: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: font.medium,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.2857%',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dayBtn: {
    width: 34,
    height: 34,
    borderWidth: 0.5,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 13, fontWeight: font.medium },
  calendarCloseBtn: {
    borderWidth: 0.5,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  calendarCloseText: { fontSize: 14, fontWeight: font.medium },
});
