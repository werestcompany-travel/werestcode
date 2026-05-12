'use client';

interface DressCodeBadgeProps {
  /** If true render the full info card; if false render just a compact pill badge */
  compact?: boolean;
}

export default function DressCodeBadge({ compact = false }: DressCodeBadgeProps) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
        👔 Dress code
      </span>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl" aria-hidden="true">👔</span>
        <div>
          <p className="font-extrabold text-amber-900 text-sm">Dress Code Required</p>
          <p className="text-xs text-amber-700">Respectful attire is mandatory at this attraction</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[
          { emoji: '👗', label: 'Cover shoulders' },
          { emoji: '👖', label: 'Cover knees'     },
          { emoji: '🚫', label: 'No shorts'       },
          { emoji: '🚫', label: 'No sleeveless'   },
        ].map(item => (
          <div key={item.label}
            className="flex items-center gap-1.5 bg-amber-100/70 rounded-xl px-3 py-2">
            <span className="text-base" aria-hidden="true">{item.emoji}</span>
            <span className="text-xs font-semibold text-amber-800 leading-tight">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2.5 border border-amber-100">
        <span className="text-base" aria-hidden="true">🧣</span>
        <p className="text-xs text-amber-800 font-medium">
          Sarongs available to borrow free of charge at the entrance
        </p>
      </div>
    </div>
  );
}
