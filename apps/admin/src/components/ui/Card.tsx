import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, action, actions, children, className }: CardProps) {
  const headerAction = actions ?? action;
  return (
    <div className={`card ${className ?? ''}`}>
      {(title || subtitle || headerAction) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="info-item-label">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}
