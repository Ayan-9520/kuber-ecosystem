import { Monitor, Moon, Sun } from 'lucide-react';

import { useTheme } from './ThemeProvider';

const MODES = [
  { id: 'light' as const, label: 'Light', icon: Sun },
  { id: 'dark' as const, label: 'Dark', icon: Moon },
  { id: 'system' as const, label: 'System', icon: Monitor },
];

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { preference, resolved, setPreference } = useTheme();

  if (compact) {
    const isDark = resolved === 'dark';
    return (
      <button
        type="button"
        className="btn btn-ghost btn-icon theme-switcher-btn"
        title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={() => setPreference(isDark ? 'light' : 'dark')}
      >
        {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
      </button>
    );
  }

  return (
    <div className="theme-switcher" role="group" aria-label="Theme">
      {MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`theme-switcher-option${preference === id ? ' active' : ''}`}
          title={label}
          aria-label={label}
          aria-pressed={preference === id}
          onClick={() => setPreference(id)}
        >
          <Icon size={16} strokeWidth={2} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
