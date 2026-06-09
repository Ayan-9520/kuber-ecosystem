import { useQuery } from '@tanstack/react-query';
import { Bell, ChevronDown, LogOut, Search, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/usePermissions';
import { getInitials } from '@/lib/utils';
import { notificationsService } from '@/services';
import { authService } from '@/services/auth.service';
import { ThemeSwitcher } from '@/theme/ThemeSwitcher';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsService.list({ page: 1, limit: 1, unreadOnly: true }),
    enabled: !!user,
  });

  const unreadCount = notifData?.meta?.total ?? 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayName = user?.email ?? user?.phone ?? 'User';
  const roleLabel = user?.roles?.[0]?.replace(/_/g, ' ') ?? 'User';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    if (/^LD-|lead/i.test(q) || q.length < 12) {
      navigate(`/leads?search=${encodeURIComponent(q)}`);
      return;
    }
    if (/^CU-|cust/i.test(q)) {
      navigate(`/customers?search=${encodeURIComponent(q)}`);
      return;
    }
    if (/^AP-|app/i.test(q)) {
      navigate(`/applications?search=${encodeURIComponent(q)}`);
      return;
    }
    navigate(`/leads?search=${encodeURIComponent(q)}`);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <form className="topbar-search" onSubmit={handleSearch}>
          <Search size={16} strokeWidth={2} />
          <input
            type="search"
            placeholder="Search leads, customers, applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>
      <div className="topbar-right">
        <ThemeSwitcher compact />
        <button type="button" className="btn btn-ghost btn-icon notification-btn" onClick={() => navigate('/notifications')} aria-label="Notifications">
          <Bell size={20} strokeWidth={2} />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <div className="profile-menu" ref={menuRef}>
          <button type="button" className="profile-trigger" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="profile-avatar">{getInitials(displayName)}</div>
            <div className="profile-info">
              <div className="profile-name">{displayName}</div>
              <div className="profile-role">{roleLabel}</div>
            </div>
            <ChevronDown size={16} strokeWidth={2} className="profile-chevron" />
          </button>
          {menuOpen && (
            <div className="profile-dropdown">
              <button type="button" className="profile-dropdown-item" onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
                <User size={16} /> Profile & Settings
              </button>
              <div className="profile-dropdown-divider" />
              <button
                type="button"
                className="profile-dropdown-item"
                onClick={async () => {
                  const rt = localStorage.getItem('refreshToken');
                  if (rt) {
                    try {
                      await authService.logout(rt);
                    } catch {
                      /* ignore */
                    }
                  }
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
