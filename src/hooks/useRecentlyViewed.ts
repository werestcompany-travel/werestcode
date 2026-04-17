import { useState, useEffect, useCallback } from 'react';

export interface RecentlyViewedItem {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  gradient: string;
  emoji: string;
  href: string;
  viewedAt: number;
}

const STORAGE_KEY = 'werest_recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const addItem = useCallback((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return { items, addItem, clearAll };
}
