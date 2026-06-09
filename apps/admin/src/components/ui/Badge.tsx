import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return <span className={cn('badge', `badge-${variant}`, className)}>{children}</span>;
}

const STATUS_MAP: Record<string, BadgeVariant> = {
  OPEN: 'primary',
  ASSIGNED: 'info' as BadgeVariant,
  IN_PROGRESS: 'warning',
  QUALIFIED: 'success',
  CONVERTED: 'success',
  APPROVED: 'success',
  PAID: 'success',
  RESOLVED: 'success',
  CLOSED: 'neutral',
  REJECTED: 'danger',
  LOST: 'danger',
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'primary',
  LOW: 'neutral',
  PENDING: 'warning',
  SUBMITTED: 'primary',
  DISBURSED: 'success',
};

export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_MAP[status] ?? 'neutral';
  return (
    <Badge variant={variant === ('info' as BadgeVariant) ? 'primary' : variant}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
