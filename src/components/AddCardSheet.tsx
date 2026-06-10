import React, { useState } from 'react';
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

  const reset = () => {
    setEmoji('📍'); setName(''); setDate(''); setAddress(''); setTime(''); setLink(''); setNotes(''); setPasteText('');
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
});
