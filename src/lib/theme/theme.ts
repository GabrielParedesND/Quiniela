import { Theme } from './types';
import defaultTheme from '@/data/themes/default.json';

export function loadTheme(themeName: string = 'default'): Theme {
  return defaultTheme as Theme;
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Direct mapping from semantic structure to CSS variables
  const { general, components, states, accents } = theme.colors;
  
  // General colors
  root.style.setProperty('--color-bg', general.background);
  root.style.setProperty('--color-surface', components.cards.background);
  root.style.setProperty('--color-surface2', components.cards.backgroundAlt);
  root.style.setProperty('--color-text', general.text);
  root.style.setProperty('--color-muted', general.textSecondary);
  root.style.setProperty('--color-border', components.cards.border);
  
  // Buttons
  root.style.setProperty('--color-primary', components.buttons.background);
  root.style.setProperty('--color-primaryText', components.buttons.text);
  root.style.setProperty('--color-primaryHover', components.buttons.hover);
  
  // Navbar
  root.style.setProperty('--color-accent', components.navbar.accent);
  
  // States
  root.style.setProperty('--color-success', states.success);
  root.style.setProperty('--color-warning', states.warning);
  root.style.setProperty('--color-danger', states.error);
  root.style.setProperty('--color-info', states.info);
  
  // Accents (aliases)
  root.style.setProperty('--color-tertiary', accents.tertiary);
}
