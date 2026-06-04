# DoubleCheck

A minimal, dark-mode-first Android app that kills the "did I turn off the stove?"
anxiety. Hold each item for 1.5s to confirm it — no accidental taps — and glance
at a calming dashboard for peace of mind. 100% local, no backend.

## Features

- **Hold-to-confirm checklist** — press and hold an item for 1.5s; an animated
  green fill tracks progress, a success haptic fires on completion, and the item
  is stamped `Checked at HH:MM AM/PM`. Tap a checked item to undo.
- **Peace-of-mind dashboard** — "You're all set!" when everything's done, plus a
  log of the last 5 completed days.
- **Manage items** — add custom checks and delete existing ones.
- **Reset All** — clears checks for the next day, logging the completion to
  history first (only if everything was checked).

## Tech

- Expo SDK 52 / React Native 0.76 (functional components + hooks)
- `expo-haptics` for tactile feedback
- `@react-native-async-storage/async-storage` for local persistence
- No navigation library — a lightweight bottom tab bar switches the 3 views

## Run it

```bash
npm install        # or: yarn
npx expo start     # then press 'a' for Android, or scan the QR in Expo Go
```

## Project structure

```
App.js                         # root: state, storage wiring, tab bar
index.js                       # Expo entry point
src/
  theme.js                     # colors / spacing / radius / type tokens
  storage.js                   # AsyncStorage helpers + date/time formatting
  components/
    HoldToConfirmItem.js       # the press-and-hold checklist row
  screens/
    ChecklistScreen.js         # main checklist + Reset All
    HistoryScreen.js           # peace-of-mind dashboard + completion log
    ManageScreen.js            # add / delete items
```

## How data is stored

Two AsyncStorage keys:

- `@doublecheck/items` — `[{ id, label, checked, checkedAt }]`
- `@doublecheck/history` — last 5 completion events `[{ date, completedAt, ... }]`

Defaults (Stove, Front Door, AC) are seeded on first launch.
