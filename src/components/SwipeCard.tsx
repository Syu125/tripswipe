import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Linking,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { TripCard } from '../types';
import { getColors, radius, spacing, font } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

interface Props {
  card: TripCard;
  onDone: () => void;
  onSkip: () => void;
  isTop: boolean;
  stackIndex: number;
}

export default function SwipeCard({ card, onDone, onSkip, isTop, stackIndex }: Props) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [card.id]);

  const gesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.15;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 280 });
        runOnJS(onDone)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 280 });
        runOnJS(onSkip)();
      } else {
        translateX.value = withSpring(0, { damping: 20 });
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12],
      Extrapolation.CLAMP
    );
    const baseY = stackIndex * 6;
    const baseRotate = stackIndex === 1 ? 1.5 : stackIndex === 2 ? -1 : 0;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + baseY },
        { rotate: `${isTop ? rotate : baseRotate}deg` },
      ],
      zIndex: isTop ? 10 : 10 - stackIndex,
    };
  });

  const doneOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD * 0.6], [0, 1], Extrapolation.CLAMP),
  }));

  const skipOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD * 0.6, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const openLink = () => {
    const url = card.link.startsWith('http') ? card.link : `https://${card.link}`;
    Linking.openURL(url).catch(() => {});
  };

  const displayHost = () => {
    try {
      const url = card.link.startsWith('http') ? card.link : `https://${card.link}`;
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return card.link;
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        {/* Done label */}
        <Animated.View style={[styles.label, styles.doneLabel, { backgroundColor: colors.successBg, borderColor: colors.success }, doneOpacity]}>
          <Text style={[styles.labelText, { color: colors.success }]}>Done ✓</Text>
        </Animated.View>

        {/* Skip label */}
        <Animated.View style={[styles.label, styles.skipLabel, { backgroundColor: colors.dangerBg, borderColor: colors.danger }, skipOpacity]}>
          <Text style={[styles.labelText, { color: colors.danger }]}>Later</Text>
        </Animated.View>

        {/* Card content */}
        <Text style={styles.emoji}>{card.emoji}</Text>
        <Text style={[styles.name, { color: colors.text }]}>{card.name}</Text>

        {!!card.time && (
          <View style={styles.row}>
            <Text style={[styles.rowIcon]}>🕐</Text>
            <Text style={[styles.rowText, { color: colors.textSecondary }]}>{card.time}</Text>
          </View>
        )}

        {!!card.address && (
          <View style={styles.row}>
            <Text style={styles.rowIcon}>📌</Text>
            <Text style={[styles.rowText, { color: colors.textSecondary }]}>{card.address}</Text>
          </View>
        )}

        {!!card.link && (
          <TouchableOpacity style={styles.row} onPress={openLink} activeOpacity={0.7}>
            <Text style={styles.rowIcon}>🗺️</Text>
            <Text style={[styles.rowText, { color: colors.info }]}>{displayHost()}</Text>
          </TouchableOpacity>
        )}

        {!!card.notes && (
          <View style={styles.row}>
            <Text style={styles.rowIcon}>📝</Text>
            <Text style={[styles.rowText, { color: colors.textSecondary }]}>{card.notes}</Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    minHeight: 280,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    padding: spacing.xl,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  name: {
    fontSize: 22,
    fontWeight: font.semibold,
    lineHeight: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rowIcon: {
    fontSize: 15,
    marginTop: 1,
  },
  rowText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  label: {
    position: 'absolute',
    top: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    zIndex: 20,
  },
  doneLabel: {
    left: 16,
  },
  skipLabel: {
    right: 16,
  },
  labelText: {
    fontSize: 13,
    fontWeight: font.medium,
  },
});
