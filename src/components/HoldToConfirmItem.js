// A borderless checklist row with a "press and hold for 1.5s" confirmation.
// While held, a thin emerald ring sweeps closed around the indicator and a
// faint wash eases in across the row; on completion we fire a success haptic
// and flip the item to its checked state. Tap a checked item to undo.

import React, { useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, font, radius, spacing } from '../theme';

const HOLD_DURATION_MS = 1500;
const RING_SIZE = 28;

export default function HoldToConfirmItem({ item, onConfirm, onUncheck }) {
  // 0 -> 1 progress of the current hold.
  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  // Guards against the animation callback firing after an early release.
  const completedRef = useRef(false);

  const startHold = () => {
    // Reset on every press-down so a finished hold's flag can't linger and
    // block a later undo tap.
    completedRef.current = false;
    if (item.checked) return;

    Haptics.selectionAsync().catch(() => {});

    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      // Gentle ease-in-out gives the fill a premium, deliberate feel.
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false, // animating width + scale of non-transform props
    });

    animationRef.current.start(({ finished }) => {
      if (finished && !completedRef.current) {
        completedRef.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {}
        );
        onConfirm(item.id);
        progress.setValue(0);
      }
    });
  };

  const cancelHold = () => {
    if (completedRef.current) return;
    if (animationRef.current) animationRef.current.stop();
    Animated.timing(progress, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const checked = item.checked;

  // Faint wash that eases in behind the row content while holding.
  const washOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  // Indicator's inner dot scales up as the hold nears completion.
  const innerScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  // Ring rim brightens as progress grows.
  const rimColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.hairline, colors.emeraldRim],
  });

  return (
    <Pressable
      onPressIn={startHold}
      onPressOut={cancelHold}
      // Tapping an already-checked item lets the user undo it — but the
      // release that ENDS a successful hold also fires onPress, so skip the
      // undo in that case (the item was just confirmed, not tapped).
      onPress={() => {
        if (completedRef.current) {
          completedRef.current = false;
          return;
        }
        if (checked && onUncheck) {
          Haptics.selectionAsync().catch(() => {});
          onUncheck(item.id);
        }
      }}
      style={styles.row}
    >
      {/* Faint emerald wash during the hold */}
      {!checked && (
        <Animated.View
          pointerEvents="none"
          style={[styles.wash, { opacity: washOpacity }]}
        />
      )}

      <View style={styles.content}>
        {/* Indicator */}
        <View style={styles.indicatorWrap}>
          {checked ? (
            <View style={styles.ringChecked}>
              <Feather name="check" size={16} color={colors.background} />
            </View>
          ) : (
            <Animated.View style={[styles.ring, { borderColor: rimColor }]}>
              <Animated.View
                style={[styles.ringFill, { transform: [{ scale: innerScale }] }]}
              />
            </Animated.View>
          )}
        </View>

        <View style={styles.textCol}>
          <Text
            style={[styles.label, checked && styles.labelChecked]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
          <Text style={[styles.hint, checked && styles.hintChecked]}>
            {checked ? `Checked at ${item.checkedAt}` : 'Hold to confirm'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.lg - 4, // ~20, generous breathing room
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    overflow: 'hidden',
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.emeraldFaint,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringFill: {
    width: RING_SIZE - 8,
    height: RING_SIZE - 8,
    borderRadius: radius.pill,
    backgroundColor: colors.emerald,
  },
  ringChecked: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  label: {
    color: colors.textPrimary,
    fontSize: font.body,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelChecked: {
    color: colors.textPrimary,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: font.caption,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  hintChecked: {
    color: colors.emerald,
  },
});
