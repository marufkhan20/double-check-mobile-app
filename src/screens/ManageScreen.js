// Manage Items: add custom checks and remove existing ones.
// Sleek rounded input track with no harsh borders; bare line-art trash icon.

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, font, radius, spacing } from '../theme';

// Enable layout animations on older Android (no-op on the new architecture).
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Smooth fade-in on add, fade-out on delete, with siblings easing into place.
const LIST_ANIM = {
  duration: 260,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

export default function ManageScreen({ items, onAddItem, onDeleteItem }) {
  const [text, setText] = useState('');
  const canAdd = text.trim().length > 0;

  const handleAdd = () => {
    const label = text.trim();
    if (!label) return;
    Haptics.selectionAsync().catch(() => {});
    LayoutAnimation.configureNext(LIST_ANIM);
    onAddItem(label);
    setText('');
  };

  const handleDelete = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    LayoutAnimation.configureNext(LIST_ANIM);
    onDeleteItem(id);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.body}>
        <Text style={styles.eyebrow}>Your list</Text>
        <Text style={styles.title}>Manage items</Text>

        {/* Sleek rounded input track — backgroundColor #111, no borders */}
        <View style={styles.inputTrack}>
          <TextInput
            style={styles.input}
            placeholder="Add an item…"
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            maxLength={40}
            selectionColor={colors.emerald}
          />
          <Pressable
            onPress={handleAdd}
            disabled={!canAdd}
            hitSlop={10}
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
          >
            <Feather
              name="plus"
              size={22}
              color={canAdd ? colors.emerald : colors.textFaint}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {items.length === 0 ? (
            <Text style={styles.emptyText}>
              No items yet — add your first above.
            </Text>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemLabel} numberOfLines={1}>
                  {item.label}
                </Text>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  hitSlop={14}
                  style={({ pressed }) => [
                    styles.trashBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Feather name="trash-2" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
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
    marginBottom: spacing.lg,
  },
  inputTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    marginBottom: spacing.xl,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: font.body,
    paddingVertical: spacing.md,
    letterSpacing: 0.2,
  },
  addBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.45 },
  list: { paddingBottom: spacing.xl },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: font.body,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  trashBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: font.label,
    marginTop: spacing.lg,
    letterSpacing: 0.2,
  },
});
