'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface RawWishlistItem {
  id: string;
  attractionId: string;
  attractionName: string;
  attractionUrl?: string;
  itemType: string;
  itemImage?: string;
  createdAt: string;
}

export interface WishlistTogglePayload {
  itemId:    string;
  itemName:  string;
  itemUrl:   string;
  itemType?: 'attraction' | 'tour';
  itemImage?: string;
}

export type WishlistToggleResult = 'added' | 'removed' | 'auth_required' | 'error';

interface WishlistContextValue {
  isWishlisted:   (id: string) => boolean;
  toggle:         (payload: WishlistTogglePayload) => Promise<WishlistToggleResult>;
  wishlistedIds:  Set<string>;
  isLoggedIn:     boolean;
  loaded:         boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [isLoggedIn,    setIsLoggedIn]    = useState(false);
  const [loaded,        setLoaded]        = useState(false);

  const refreshWishlist = useCallback(async () => {
    const [meRes, wlRes] = await Promise.all([
      fetch('/api/user/me'),
      fetch('/api/user/wishlist'),
    ]);
    const meData = await meRes.json();
    const wlData = await wlRes.json();
    setIsLoggedIn(!!meData.user);
    setWishlistedIds(new Set<string>(
      (wlData.items ?? []).map((i: RawWishlistItem) => i.attractionId)
    ));
    setLoaded(true);
  }, []);

  useEffect(() => { refreshWishlist(); }, [refreshWishlist]);

  /* Re-sync after sign-in via auth modal */
  useEffect(() => {
    const handler = () => refreshWishlist();
    document.addEventListener('userSignedIn', handler);
    return () => document.removeEventListener('userSignedIn', handler);
  }, [refreshWishlist]);

  const toggle = useCallback(async (payload: WishlistTogglePayload): Promise<WishlistToggleResult> => {
    if (!isLoggedIn) {
      document.dispatchEvent(new CustomEvent('openAuthModal'));
      return 'auth_required';
    }

    const { itemId, itemName, itemUrl, itemType = 'attraction', itemImage } = payload;
    const wasWishlisted = wishlistedIds.has(itemId);

    /* Optimistic update */
    setWishlistedIds(prev => {
      const next = new Set(prev);
      wasWishlisted ? next.delete(itemId) : next.add(itemId);
      return next;
    });

    try {
      if (wasWishlisted) {
        await fetch(`/api/user/wishlist?attractionId=${encodeURIComponent(itemId)}`, { method: 'DELETE' });
      } else {
        await fetch('/api/user/wishlist', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attractionId: itemId, attractionName: itemName, attractionUrl: itemUrl, itemType, itemImage }),
        });
      }
      return wasWishlisted ? 'removed' : 'added';
    } catch {
      /* Rollback on error */
      setWishlistedIds(prev => {
        const next = new Set(prev);
        wasWishlisted ? next.add(itemId) : next.delete(itemId);
        return next;
      });
      return 'error';
    }
  }, [wishlistedIds, isLoggedIn]);

  const isWishlisted = useCallback((id: string) => wishlistedIds.has(id), [wishlistedIds]);

  return (
    <WishlistContext.Provider value={{ isWishlisted, toggle, wishlistedIds, isLoggedIn, loaded, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
}
