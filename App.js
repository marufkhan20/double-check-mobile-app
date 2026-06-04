// DoubleCheck — root component.
// Owns all app state, persists to AsyncStorage, and switches between the three
// views with a minimal bottom tab bar (no navigation library needed).

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

import ChecklistScreen from './src/screens/ChecklistScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ManageScreen from './src/screens/ManageScreen';
import {
  formatTime,
  loadHistory,
  loadItems,
  recordCompletion,
  saveItems,
} from './src/storage';
import { colors, font, spacing } from './src/theme';

const TABS = [
  { key: 'checklist', label: 'Checklist', icon: 'check-circle' },
  { key: 'history', label: 'Peace', icon: 'sunrise' },
  { key: 'manage', label: 'Manage', icon: 'sliders' },
];

function AppContent() {
  const [tab, setTab] = useState('checklist');
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cross-fade + subtle rise whenever the active tab changes.
  const transition = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [tab, transition]);

  const screenTranslate = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  // Initial hydrate from storage.
  useEffect(() => {
    (async () => {
      const [storedItems, storedHistory] = await Promise.all([
        loadItems(),
        loadHistory(),
      ]);
      setItems(storedItems);
      setHistory(storedHistory);
      setLoading(false);
    })();
  }, []);

  // Persist items whenever they change (after initial load).
  useEffect(() => {
    if (!loading) saveItems(items);
  }, [items, loading]);

  const confirmItem = useCallback((id) => {
    const checkedAt = formatTime(new Date());
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, checked: true, checkedAt } : it
      )
    );
  }, []);

  const uncheckItem = useCallback((id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, checked: false, checkedAt: null } : it
      )
    );
  }, []);

  const addItem = useCallback((label) => {
    const id = `item-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    setItems((prev) => [...prev, { id, label, checked: false, checkedAt: null }]);
  }, []);

  const deleteItem = useCallback((id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const resetAll = useCallback(async () => {
    // Log the completion first — but only if everything was actually checked.
    const allDone = items.length > 0 && items.every((it) => it.checked);
    if (allDone) {
      const updated = await recordCompletion(new Date());
      setHistory(updated);
    }
    setItems((prev) =>
      prev.map((it) => ({ ...it, checked: false, checkedAt: null }))
    );
  }, [items]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.app, styles.center]}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.emerald} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="light" />

      <Animated.View
        style={[
          styles.screen,
          { opacity: transition, transform: [{ translateY: screenTranslate }] },
        ]}
      >
        {tab === 'checklist' && (
          <ChecklistScreen
            items={items}
            onConfirm={confirmItem}
            onUncheck={uncheckItem}
            onResetAll={resetAll}
          />
        )}
        {tab === 'history' && <HistoryScreen items={items} history={history} />}
        {tab === 'manage' && (
          <ManageScreen
            items={items}
            onAddItem={addItem}
            onDeleteItem={deleteItem}
          />
        )}
      </Animated.View>

      {/* Minimal bottom tab bar — pure black, line-art icons */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          const tint = active ? colors.emerald : colors.textMuted;
          return (
            <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
              <Feather name={t.icon} size={22} color={tint} />
              <Text style={[styles.tabLabel, { color: tint }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// SafeAreaProvider supplies real inset values on Android (the react-native
// SafeAreaView is a no-op there), so content clears the status and nav bars.
export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  tabLabel: {
    fontSize: font.caption - 1,
    marginTop: 5,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});
