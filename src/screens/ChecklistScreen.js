// Main checklist: hold each item to confirm, then "Reset Checklist" for the
// next day. Borderless, generously spaced, OLED-minimal.

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import HoldToConfirmItem from '../components/HoldToConfirmItem';
import ConfirmModal from '../components/ConfirmModal';
import { colors, font, radius, spacing } from '../theme';

export default function ChecklistScreen({ items, onConfirm, onUncheck, onResetAll }) {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const checkedCount = useMemo(
    () => items.filter((i) => i.checked).length,
    [items]
  );
  const total = items.length;
  const allDone = total > 0 && checkedCount === total;

  const handleReset = () => {
    setConfirmVisible(false);
    onResetAll();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Before you go</Text>
          <Text style={styles.title}>
            {allDone ? 'All clear' : `${checkedCount} / ${total}`}
          </Text>
          <Text style={styles.subtitle}>
            {allDone
              ? 'Everything is checked. Safe travels.'
              : 'Hold each item to confirm it.'}
          </Text>
        </View>

        {/* Hairline progress line */}
        <View style={styles.track}>
          <View
            style={[
              styles.trackFill,
              { width: `${total ? (checkedCount / total) * 100 : 0}%` },
            ]}
          />
        </View>

        {total === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No items yet.{'\n'}Add some in the Manage tab.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <HoldToConfirmItem
                key={item.id}
                item={item}
                onConfirm={onConfirm}
                onUncheck={onUncheck}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {total > 0 && (
        <View style={styles.footer}>
          <Pressable
            onPress={() => setConfirmVisible(true)}
            hitSlop={12}
            style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
          >
            <Text style={styles.resetText}>Reset Checklist</Text>
          </Pressable>
        </View>
      )}

      <ConfirmModal
        visible={confirmVisible}
        title="Reset checklist?"
        message="Today's completion will be logged to your history first."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleReset}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: { marginBottom: spacing.xl },
  eyebrow: {
    color: colors.textMuted,
    fontSize: font.caption,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: font.display,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: font.label,
    marginTop: spacing.xs,
    letterSpacing: 0.2,
  },
  track: {
    height: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.divider,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors.emerald,
    borderRadius: radius.pill,
  },
  list: {
    // first row's top divider is visually absorbed by the track above
    marginTop: spacing.xs,
  },
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: font.body,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  resetBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pressed: { opacity: 0.45 },
  resetText: {
    color: colors.redMuted,
    fontSize: font.label,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});
