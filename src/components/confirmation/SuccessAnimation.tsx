'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessAnimation() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`transition-all duration-700 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
      <div className="relative w-24 h-24 mx-auto">
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" style={{ animationDuration: '1.5s' }} />
        <span className="absolute inset-2 rounded-full bg-green-400/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-200 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
