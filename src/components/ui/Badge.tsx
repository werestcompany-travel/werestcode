import { cn } from '@/lib/utils';
import { BookingStatus } from '@/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        STATUS_COLORS[status],
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status]}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  color?: 'gray' | 'green' | 'blue' | 'amber' | 'red' | 'teal';
  className?: string;
}

const BADGE_COLORS: Record<NonNullable<BadgeProps['color']>, string> = {
  gray:  'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-800',
  blue:  'bg-blue-100 text-blue-800',
  amber: 'bg-amber-100 text-amber-800',
  red:   'bg-red-100 text-red-800',
  teal:  'bg-brand-100 text-brand-800',
};

export function Badge({ children, color = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        BADGE_COLORS[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
