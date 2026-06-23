import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

import { filterNavByPermissions, groupNavItems } from '@/config/navigation';
import { usePermissions } from '@/hooks/usePermissions';

interface SidebarProps {
  open?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ open = false, onNavigate }: SidebarProps) {
  const { user } = usePermissions();
  const permissions = user?.permissions ?? [];
  const roles = user?.roles ?? [];
  const navItems = filterNavByPermissions(permissions, roles);
  const grouped = groupNavItems(navItems);

  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">K</div>
        <div className="sidebar-brand-text">
          <div className="brand-name">KuberOne</div>
          <div className="brand-tagline">Kuber Finserve</div>
        </div>
        <button
          type="button"
          className="sidebar-close-btn"
          aria-label="Close menu"
          onClick={onNavigate}
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="nav-section">
            <div className="nav-section-title">{section}</div>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  onClick={onNavigate}
                >
                  <Icon size={18} strokeWidth={2} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
