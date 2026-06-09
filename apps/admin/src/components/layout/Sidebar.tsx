import { NavLink } from 'react-router-dom';

import { filterNavByPermissions, groupNavItems } from '@/config/navigation';
import { usePermissions } from '@/hooks/usePermissions';

export function Sidebar() {
  const { user } = usePermissions();
  const permissions = user?.permissions ?? [];
  const roles = user?.roles ?? [];
  const navItems = filterNavByPermissions(permissions, roles);
  const grouped = groupNavItems(navItems);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">K</div>
        <div>
          <div className="brand-name">KuberOne</div>
          <div className="brand-tagline">Kuber Finserve</div>
        </div>
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
