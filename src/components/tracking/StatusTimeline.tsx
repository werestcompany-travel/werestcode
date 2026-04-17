import { BookingStatus, BookingStatusHistory } from '@/types';
import { STATUS_LABELS, STATUS_FLOW } from '@/lib/utils';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusTimelineProps {
  currentStatus: BookingStatus;
  history: BookingStatusHistory[];
}

const STATUS_ICONS: Record<BookingStatus, string> = {
  PENDING:          '📋',
  DRIVER_CONFIRMED: '✅',
  DRIVER_STANDBY:   '🚗',
  DRIVER_PICKED_UP: '🛣️',
  COMPLETED:        '🏁',
  CANCELLED:        '❌',
};

export default function StatusTimeline({ currentStatus, history }: StatusTimelineProps) {
  const isCancelled = currentStatus === 'CANCELLED';
  const flow = isCancelled ? [...STATUS_FLOW, 'CANCELLED' as BookingStatus] : STATUS_FLOW;

  const getHistoryEntry = (status: BookingStatus) =>
    history.find((h) => h.status === status);

  const getStepState = (status: BookingStatus): 'done' | 'active' | 'upcoming' => {
    if (status === currentStatus) return 'active';
    const currentIdx = flow.indexOf(currentStatus);
    const stepIdx = flow.indexOf(status);
    if (stepIdx < currentIdx) return 'done';
    return 'upcoming';
  };

  return (
    <div className="space-y-1">
      {flow.map((status, idx) => {
        const state = getStepState(status);
        const entry = getHistoryEntry(status);
        const isLast = idx === flow.length - 1;

        return (
          <div key={status} className="flex gap-4">
            {/* Line + Icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 transition-all',
                  state === 'done'    && 'bg-brand-600 text-white',
                  state === 'active'  && 'bg-brand-50 border-2 border-brand-600 animate-pulse',
                  state === 'upcoming' && 'bg-gray-100',
                )}
              >
                {state === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : state === 'active' ? (
                  <Clock className="w-4 h-4 text-brand-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[24px] my-1 rounded-full',
                    state === 'done' ? 'bg-brand-300' : 'bg-gray-100',
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-4 flex-1', isLast && 'pb-0')}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base">{STATUS_ICONS[status]}</span>
                <span
                  className={cn(
                    'font-semibold text-sm',
                    state === 'active'   && 'text-brand-700',
                    state === 'done'     && 'text-gray-700',
                    state === 'upcoming' && 'text-gray-300',
                  )}
                >
                  {STATUS_LABELS[status]}
                </span>
                {state === 'active' && (
                  <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                    CURRENT
                  </span>
                )}
              </div>
              {entry && (
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>{new Date(entry.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  {entry.note && <p className="text-gray-500 italic">{entry.note}</p>}
                  {entry.updatedBy && <p>by {entry.updatedBy}</p>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
