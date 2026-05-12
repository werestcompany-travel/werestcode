import { Clock, Users, Globe2, MapPin, CheckCircle2, Zap, Smartphone } from 'lucide-react'
import { type Tour } from '@/lib/tours'

interface QuickInfoBarProps {
  tour: Tour
}

export default function QuickInfoBar({ tour }: QuickInfoBarProps) {
  const items = [
    {
      icon: <Clock className="w-4 h-4 text-[#2534ff]" />,
      label: 'Duration',
      value: tour.duration,
    },
    {
      icon: <Users className="w-4 h-4 text-[#2534ff]" />,
      label: 'Group size',
      value: `Up to ${tour.maxGroupSize} people`,
    },
    {
      icon: <Globe2 className="w-4 h-4 text-[#2534ff]" />,
      label: 'Languages',
      value: tour.languages.join(', '),
    },
    {
      icon: <MapPin className="w-4 h-4 text-[#2534ff]" />,
      label: 'Pickup',
      value: 'Hotel pickup available',
    },
    {
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      label: 'Cancellation',
      value: 'Free cancellation',
    },
    {
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      label: 'Confirmation',
      value: 'Instant',
    },
    {
      icon: <Smartphone className="w-4 h-4 text-indigo-500" />,
      label: 'Ticket',
      value: 'Mobile ticket',
    },
  ]

  return (
    <div className="overflow-x-auto scrollbar-none -mx-4 sm:mx-0">
      <div className="flex gap-3 px-4 sm:px-0 sm:flex-wrap">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 shrink-0 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 min-w-max"
          >
            <span className="shrink-0">{item.icon}</span>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide leading-none mb-0.5">
                {item.label}
              </p>
              <p className="text-xs font-semibold text-gray-800 leading-tight">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
