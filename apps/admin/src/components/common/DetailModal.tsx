import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';

import styles from './DetailModal.module.css';

interface DetailModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}

export function DetailModal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = 'md',
}: DetailModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <button type="button" className={styles.backdrop} aria-label="Close dialog" onClick={onClose} />
      <div className={`${styles.panel} ${size === 'lg' ? styles.panelLg : ''}`}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h2 id="detail-modal-title" className={styles.title}>
              {title}
            </h2>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>
  );
}
