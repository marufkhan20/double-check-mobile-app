// Local persistence layer for DoubleCheck.
// Everything lives on-device via AsyncStorage — no backend, no network.

import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEMS_KEY = '@doublecheck/items';
const HISTORY_KEY = '@doublecheck/history';

// Seeded the very first time the app runs.
const DEFAULT_ITEMS = [
  { id: 'seed-stove', label: 'Stove', checked: false, checkedAt: null },
  { id: 'seed-front-door', label: 'Front Door', checked: false, checkedAt: null },
  { id: 'seed-ac', label: 'AC', checked: false, checkedAt: null },
];

const HISTORY_LIMIT = 5;

/**
 * Load the checklist items. Seeds defaults on first launch.
 * @returns {Promise<Array<{id, label, checked, checkedAt}>>}
 */
export async function loadItems() {
  try {
    const raw = await AsyncStorage.getItem(ITEMS_KEY);
    if (raw == null) {
      await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(DEFAULT_ITEMS));
      return DEFAULT_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[storage] loadItems failed', err);
    return DEFAULT_ITEMS;
  }
}

/**
 * Persist the full items array.
 * @param {Array} items
 */
export async function saveItems(items) {
  try {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[storage] saveItems failed', err);
  }
}

/**
 * Load completion history, newest first.
 * @returns {Promise<Array<{date, completedAt, label}>>}
 */
export async function loadHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw == null ? [] : JSON.parse(raw);
  } catch (err) {
    console.warn('[storage] loadHistory failed', err);
    return [];
  }
}

/**
 * Record a completed-checklist event, keeping only the most recent N days.
 * If the checklist was already completed today, the existing entry is updated
 * rather than duplicated.
 * @param {Date} when - moment of completion
 * @returns {Promise<Array>} the updated history list
 */
export async function recordCompletion(when = new Date()) {
  try {
    const history = await loadHistory();
    const entry = {
      date: formatDate(when), // e.g. "June 4"
      dayKey: when.toDateString(), // dedupe key
      completedAt: formatTime(when), // e.g. "8:15 AM"
      timestamp: when.getTime(),
    };

    const withoutToday = history.filter((h) => h.dayKey !== entry.dayKey);
    const next = [entry, ...withoutToday].slice(0, HISTORY_LIMIT);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    console.warn('[storage] recordCompletion failed', err);
    return [];
  }
}

// ---------- formatting helpers (also reused by the UI) ----------

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "June 4" */
export function formatDate(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** "8:15 AM" */
export function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${mm} ${period}`;
}
