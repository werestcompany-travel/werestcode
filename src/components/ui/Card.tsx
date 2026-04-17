import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover, selected, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-card',
        hover && 'cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        selected && 'border-brand-500 ring-2 ring-brand-500/20 shadow-card-hover',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}
