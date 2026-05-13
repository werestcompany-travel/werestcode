'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function TripHeroSearch() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(searchParams.get('location') ?? searchParams.get('q') ?? '');
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
    if (trimmed) { p.set('location', trimmed); } else { p.delete('location'); }
    p.delete('q');
    p.delete('page');
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-white rounded-xl overflow-hidden shadow-xl"
      style={{ height: 56, maxWidth: 780 }}
    >
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Bangkok"
        aria-label="Search destinations or activities"
        className="flex-1 px-5 text-gray-700 text-[15px] placeholder:text-gray-400 focus:outline-none bg-transparent"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex items-center gap-2 px-6 h-full text-white font-semibold text-sm shrink-0 transition-opacity hover:opacity-90"
        style={{ background: '#1677FF' }}
      >
        <Search className="w-4 h-4" />
        Search
      </button>
    </form>
  );
}
