export type ThemeKey = 'lavender' | 'blue' | 'teal' | 'dark';

export interface ThemeConfig {
  label: string;
  vars: Record<string, string>;
}

export const themes: Record<ThemeKey, ThemeConfig> = {
  lavender: {
    label: 'Lavender',
    vars: {
      '--ipqc-bg': '#f8f7ff',
      '--ipqc-bg-secondary': '#f0eeff',
      '--ipqc-surface': '#ffffff',
      '--ipqc-surface-hover': '#f3f0ff',
      '--ipqc-border': '#e2daf8',
      '--ipqc-border-strong': '#c4b5f4',
      '--ipqc-accent': '#7c3aed',
      '--ipqc-accent-light': '#a78bfa',
      '--ipqc-accent-ultra-light': '#ede9fe',
      '--ipqc-accent-glow': 'rgba(124,58,237,0.18)',
      '--ipqc-text-primary': '#1e1b4b',
      '--ipqc-text-secondary': '#4c1d95',
      '--ipqc-text-muted': '#7c6fb0',
      '--ipqc-ribbon-bg': '#ffffff',
      '--ipqc-ribbon-border': '#ddd6fe',
      '--ipqc-menu-shadow': '0 4px 24px rgba(124,58,237,0.10)',
      '--ipqc-card-shadow': '0 2px 16px rgba(124,58,237,0.08)',
      '--ipqc-floor-bg': '#f3f0ff',
      '--ipqc-grid-color': 'rgba(167,139,250,0.30)',
      '--ipqc-panel-bg': 'rgba(255,255,255,0.88)',
      '--ipqc-floor-grid': '#c4b5f4',
    },
  },
  blue: {
    label: 'Blue',
    vars: {
      '--ipqc-bg': '#f0f4ff',
      '--ipqc-bg-secondary': '#e8eeff',
      '--ipqc-surface': '#ffffff',
      '--ipqc-surface-hover': '#eef2ff',
      '--ipqc-border': '#c7d2fe',
      '--ipqc-border-strong': '#818cf8',
      '--ipqc-accent': '#3730a3',
      '--ipqc-accent-light': '#6366f1',
      '--ipqc-accent-ultra-light': '#e0e7ff',
      '--ipqc-accent-glow': 'rgba(55,48,163,0.18)',
      '--ipqc-text-primary': '#1e1b4b',
      '--ipqc-text-secondary': '#312e81',
      '--ipqc-text-muted': '#6b7280',
      '--ipqc-ribbon-bg': '#ffffff',
      '--ipqc-ribbon-border': '#c7d2fe',
      '--ipqc-menu-shadow': '0 4px 24px rgba(55,48,163,0.10)',
      '--ipqc-card-shadow': '0 2px 16px rgba(55,48,163,0.08)',
      '--ipqc-floor-bg': '#eef2ff',
      '--ipqc-grid-color': 'rgba(99,102,241,0.30)',
      '--ipqc-panel-bg': 'rgba(255,255,255,0.88)',
      '--ipqc-floor-grid': '#818cf8',
    },
  },
  teal: {
    label: 'Teal',
    vars: {
      '--ipqc-bg': '#f0fdfa',
      '--ipqc-bg-secondary': '#e6faf6',
      '--ipqc-surface': '#ffffff',
      '--ipqc-surface-hover': '#f0fdfa',
      '--ipqc-border': '#99f6e4',
      '--ipqc-border-strong': '#2dd4bf',
      '--ipqc-accent': '#0f766e',
      '--ipqc-accent-light': '#14b8a6',
      '--ipqc-accent-ultra-light': '#ccfbf1',
      '--ipqc-accent-glow': 'rgba(15,118,110,0.18)',
      '--ipqc-text-primary': '#0f2d2b',
      '--ipqc-text-secondary': '#134e4a',
      '--ipqc-text-muted': '#5eada5',
      '--ipqc-ribbon-bg': '#ffffff',
      '--ipqc-ribbon-border': '#99f6e4',
      '--ipqc-menu-shadow': '0 4px 24px rgba(15,118,110,0.10)',
      '--ipqc-card-shadow': '0 2px 16px rgba(15,118,110,0.08)',
      '--ipqc-floor-bg': '#f0fdfa',
      '--ipqc-grid-color': 'rgba(45,212,191,0.30)',
      '--ipqc-panel-bg': 'rgba(255,255,255,0.88)',
      '--ipqc-floor-grid': '#2dd4bf',
    },
  },
  dark: {
    label: 'Dark',
    vars: {
      '--ipqc-bg': '#0f0e17',
      '--ipqc-bg-secondary': '#16152a',
      '--ipqc-surface': '#1e1d35',
      '--ipqc-surface-hover': '#2a2845',
      '--ipqc-border': '#312e5a',
      '--ipqc-border-strong': '#5b56a0',
      '--ipqc-accent': '#a78bfa',
      '--ipqc-accent-light': '#c4b5fd',
      '--ipqc-accent-ultra-light': '#2d2a4a',
      '--ipqc-accent-glow': 'rgba(167,139,250,0.25)',
      '--ipqc-text-primary': '#f1f0ff',
      '--ipqc-text-secondary': '#c4b5fd',
      '--ipqc-text-muted': '#7c7aad',
      '--ipqc-ribbon-bg': '#16152a',
      '--ipqc-ribbon-border': '#312e5a',
      '--ipqc-menu-shadow': '0 4px 24px rgba(0,0,0,0.40)',
      '--ipqc-card-shadow': '0 2px 16px rgba(0,0,0,0.30)',
      '--ipqc-floor-bg': '#13122a',
      '--ipqc-grid-color': 'rgba(167,139,250,0.18)',
      '--ipqc-panel-bg': 'rgba(30,29,53,0.92)',
      '--ipqc-floor-grid': '#5b56a0',
    },
  },
};

export function applyTheme(key: ThemeKey) {
  const config = themes[key];
  const root = document.documentElement;
  Object.entries(config.vars).forEach(([k, v]) => root.style.setProperty(k, v));
}
