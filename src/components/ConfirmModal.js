// A minimal, theme-matched confirmation dialog — replaces the OS default
// Alert. Fades the backdrop in and springs the card up; animates back out
// before unmounting so dismissal feels smooth.

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, font, radius, spacing } from '../theme';

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) {
  // Keep the modal mounted through its exit animation.
  const [rendered, setRendered] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (rendered) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!rendered) return null;

  const cardStyle = {
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }),
      },
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
      },
    ],
  };

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: anim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        </Animated.View>

        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                destructive ? styles.confirmDestructive : styles.confirmDefault,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={destructive ? styles.confirmDestructiveText : styles.confirmText}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: font.heading,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  message: {
    color: colors.textSecondary,
    fontSize: font.label,
    lineHeight: 22,
    marginTop: spacing.sm,
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.55 },
  cancelText: {
    color: colors.textSecondary,
    fontSize: font.label,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  confirmDefault: {
    backgroundColor: colors.emeraldSoft,
    marginLeft: spacing.sm,
  },
  confirmText: {
    color: colors.emerald,
    fontSize: font.label,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  confirmDestructive: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    marginLeft: spacing.sm,
  },
  confirmDestructiveText: {
    color: colors.redMuted,
    fontSize: font.label,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
