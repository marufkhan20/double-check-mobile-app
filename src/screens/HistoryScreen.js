// Peace-of-mind dashboard. Maximal negative space, a single soft status
// indicator centered in the canvas, and a borderless timeline of the last
// 5 completed days.

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, font, spacing } from '../theme';

export default function HistoryScreen({ items, history }) {
  const total = items.length;
  const checkedCount = items.filter((i) => i.checked).length;
  const allDone = total > 0 && checkedCount === total;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Centered hero status — pure negative space, no card */}
      <View style={styles.hero}>
        {allDone ? (
          <>
            <View style={styles.dotDone}>
              <Feather name="check" size={26} color={colors.background} />
            </View>
            <Text style={styles.heroTitle}>You're all set</Text>
            <Text style={styles.heroSub}>Everything was checked today.</Text>
          </>
        ) : (
          <>
            {/* Large, soft, single-colored status dot */}
            <View style={styles.dotGlow}>
              <View style={styles.dotPending} />
            </View>
            <Text style={styles.heroTitle}>
              {total === 0 ? 'Nothing to check yet' : 'Almost there'}
            </Text>
            <Text style={styles.heroSub}>
              {total === 0
                ? 'Add items in the Manage tab to begin.'
                : `${checkedCount} of ${total} confirmed.`}
            </Text>
          </>
        )}
      </View>

      <Text style={styles.sectionLabel}>Recently completed</Text>

      {history.length === 0 ? (
        <Text style={styles.emptyText}>
          No completed days yet. Finish your checklist and reset to log your
          first one.
        </Text>
      ) : (
        <View style={styles.timeline}>
          {history.map((h, i) => {
            const last = i === history.length - 1;
            return (
              <View key={h.timestamp} style={styles.tlRow}>
                {/* Timeline rail: node + connecting line */}
                <View style={styles.rail}>
                  <View style={styles.node} />
                  {!last && <View style={styles.line} />}
                </View>
                <View style={styles.tlText}>
                  <Text style={styles.tlDate}>{h.date}</Text>
                  <Text style={styles.tlTime}>Completed at {h.completedAt}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const DOT = 88;
const NODE = 9;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  // Pending: large soft glow ring around a solid emerald dot
  dotGlow: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.emeraldFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  dotPending: {
    width: DOT / 2,
    height: DOT / 2,
    borderRadius: DOT / 4,
    backgroundColor: colors.emerald,
  },
  dotDone: {
    width: DOT * 0.62,
    height: DOT * 0.62,
    borderRadius: (DOT * 0.62) / 2,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: font.title,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  heroSub: {
    color: colors.textSecondary,
    fontSize: font.label,
    textAlign: 'center',
    marginTop: spacing.sm,
    letterSpacing: 0.2,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: font.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: font.label,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  timeline: {
    paddingLeft: spacing.xs,
  },
  tlRow: {
    flexDirection: 'row',
  },
  rail: {
    width: NODE,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: colors.emerald,
    marginTop: 5,
  },
  line: {
    flex: 1,
    width: 1,
    backgroundColor: colors.divider,
    marginTop: 4,
  },
  tlText: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  tlDate: {
    color: colors.textPrimary,
    fontSize: font.body,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tlTime: {
    color: colors.textSecondary,
    fontSize: font.caption,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
