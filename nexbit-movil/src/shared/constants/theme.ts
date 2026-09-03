import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0b1120',
    textSecondary: '#5b6472',
    textMuted: '#8a94a6',
    background: '#ffffff',
    backgroundElement: '#f5f5f6',
    backgroundSelected: '#e9eaee',
    border: '#e6e6e8',
    accent: '#0a0a0a',
    accentBg: 'rgba(10, 10, 10, 0.06)',
    sobreAccent: '#ffffff',
    error: '#dc2626',
    errorBg: '#fee2e2',
    errorBorder: '#fecaca',
    success: '#14532d',
    successBg: '#dcfce7',
    successBorder: '#bbf7d0',
  },
  dark: {
    text: '#f3f4f6',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    background: '#141414',
    backgroundElement: '#1a1a1a',
    backgroundSelected: '#2b2b2b',
    border: '#2b2b2b',
    accent: '#f2f2f2',
    accentBg: 'rgba(255, 255, 255, 0.12)',
    sobreAccent: '#0a0a0a',
    error: '#f87171',
    errorBg: 'rgba(248, 113, 113, 0.12)',
    errorBorder: 'rgba(248, 113, 113, 0.35)',
    success: '#4ade80',
    successBg: 'rgba(74, 222, 128, 0.12)',
    successBorder: 'rgba(74, 222, 128, 0.35)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  control: 8,
  card: 12,
  container: 20,
  pill: 999,
} as const;

export const Shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const Brand = {
  nombre: 'Nexbit',
  logotipo: 'Nx',
  slogan: 'Tu tienda en línea con productos verificados, precios justos y entrega segura en todo el país.',
} as const;

export const DashColors = {
  bg: '#0a0a0a',
  fondo: '#131313',
  card: '#151515',
  cardHover: '#1a1a1a',
  border: '#333333',
  text: '#e5e7eb',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  accent: '#f5f5f5',
  sobreAccent: '#0a0a0a',
  accentBg: 'rgba(245, 245, 245, 0.08)',
  success: '#4ade80',
  error: '#f87171',
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;