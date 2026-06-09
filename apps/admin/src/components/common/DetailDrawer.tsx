import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

interface DetailDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function DetailDrawer({ open, title, subtitle, onClose, children, footer }: DetailDrawerProps) {
  if (!open) return null;

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--color-overlay)',
          zIndex: 300,
        }}
      />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(480px, 100vw)',
          background: 'var(--color-card)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 301,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="card-header" style={{ padding: '1.25rem', marginBottom: 0, borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.125rem' }}>
              {title}
            </h2>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>{children}</div>
        {footer && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>{footer}</div>
        )}
      </aside>
    </>
  );
}
