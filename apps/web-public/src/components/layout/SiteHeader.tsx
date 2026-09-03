import { Link } from 'react-router-dom';
import { Moon, ShieldCheck, Sun } from 'lucide-react';

import { useTheme } from '@/theme/ThemeProvider';

import './SiteHeader.css';

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand">
          <ShieldCheck size={26} className="site-header__logo" />
          <div>
            <strong>Kuber Verified Professional™</strong>
            <span>Powered by Kuber Finserve</span>
          </div>
        </Link>
        <nav className="site-header__nav">
          <Link to="/professionals">Find a Professional</Link>
          <button
            type="button"
            className="btn btn-ghost site-header__theme"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
