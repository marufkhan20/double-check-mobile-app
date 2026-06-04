// Central design tokens for DoubleCheck.
// Ultra-minimalist, high-end utility feel: OLED black canvas, crisp white type,
// translucent grays, and a single refined emerald accent. Generous spacing,
// no boxy containers.

export const colors = {
  // Canvas — pure OLED black
  background: '#000000',
  // Subtle raised surfaces (inputs only — used sparingly)
  surface: '#111111',
  surfaceRaised: '#1A1A1A',

  // Hairline dividers (micro-thin, low visibility)
  divider: 'rgba(255, 255, 255, 0.06)',
  hairline: 'rgba(255, 255, 255, 0.10)',

  // Type
  textPrimary: '#FFFFFF', // absolute crisp white
  textSecondary: 'rgba(255, 255, 255, 0.5)', // muted translucent gray
  textMuted: 'rgba(255, 255, 255, 0.3)',
  textFaint: 'rgba(255, 255, 255, 0.18)',

  // Accent — refined emerald (premium, not neon)
  emerald: '#34D399',
  emeraldSoft: 'rgba(52, 211, 153, 0.14)',
  emeraldFaint: 'rgba(52, 211, 153, 0.08)',
  emeraldRim: 'rgba(52, 211, 153, 0.55)',

  // Destructive — only ever a subtle muted tint, never solid
  redMuted: 'rgba(248, 113, 113, 0.85)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 56,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
};

export const font = {
  display: 34,
  title: 28,
  heading: 20,
  body: 17,
  label: 15,
  caption: 13,
};
