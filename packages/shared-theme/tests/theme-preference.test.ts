import {
  applyDocumentTheme,
  getSystemPrefersDark,
  readStoredThemePreference,
  resolveTheme,
  storeThemePreference,
} from '../src/theme-preference.js';
import { THEME_STORAGE_KEY } from '../src/tokens.js';

describe('theme preference', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('resolves system preference to dark', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('resolves explicit preference', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('stores and reads preference', () => {
    storeThemePreference('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(readStoredThemePreference()).toBe('dark');
  });

  it('applies document theme attribute', () => {
    applyDocumentTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('reads system prefers dark', () => {
    expect(typeof getSystemPrefersDark()).toBe('boolean');
  });
});
