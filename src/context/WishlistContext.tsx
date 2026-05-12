'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const GUEST_KEY = 'werest_guest_wishlist';

interface RawWishlistItem {
  id: string;
  attractionId: string;
  attractionName: string;
  attractionUrl?: string;
  itemType: string;
  itemImage?: string;
  createdAt: string;
}

interface GuestWishlistItem {
  itemId: string;
  itemName: string;
  itemUrl: string;
  itemType: string;
  itemImage?: string;
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
  isWishlisted:    (id: string) => boolean;
  toggle:          (payload: WishlistTogglePayload) => Promise<WishlistToggleResult>;
  wishlistedIds:   Set<string>;
  isLoggedIn:      boolean;
  loaded:          boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/* ── localStorage helpers ─────────────────────────────────────────────────── */

function readGuest(): GuestWishlistItem[] {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuest(items: GuestWishlistItem[]) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {}
}

/* ── Merge guest wishlist to server after sign-in ─────────────────────────── */

async function mergeGuestWishlist() {
  const items = readGuest();
  if (items.length === 0) return;
  try {
    await fetch('/api/user/wishlist/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    localStorage.removeItem(GUEST_KEY);
  } catch {
    // non-critical — guest list stays in localStorage
  }
}

/* ── Provider ─────────────────────────────────────────────────────────────── */

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
    const loggedIn = !!meData.user;
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      // Server wishlist
      const serverIds = new Set<string>(
        (wlData.items ?? []).map((i: RawWishlistItem) => i.attractionId)
      );
      setWishlistedIds(serverIds);
    } else {
      // Guest wishlist from localStorage
      const guestItems = readGuest();
      setWishlistedIds(new Set(guestItems.map((i) => i.itemId)));
    }
    setLoaded(true);
  }, []);

  useEffect(() => { refreshWishlist(); }, [refreshWishlist]);

  /* Re-sync after sign-in: merge guest list then reload */
  useEffect(() => {
    const handler = async () => {
      await mergeGuestWishlist();
      await refreshWishlist();
    };
    document.addEventListener('userSignedIn', handler);
    return () => document.removeEventListener('userSignedIn', handler);
  }, [refreshWishlist]);

  const toggle = useCallback(async (payload: WishlistTogglePayload): Promise<WishlistToggleResult> => {
    const { itemId, itemName, itemUrl, itemType = 'attraction', itemImage } = payload;
    const wasWishlisted = wishlistedIds.has(itemId);

    if (!isLoggedIn) {
      // Guest — update localStorage
      const current = readGuest();
      if (wasWishlisted) {
        writeGuest(current.filter((i) => i.itemId !== itemId));
      } else {
        writeGuest([...current, { itemId, itemName, itemUrl, itemType, itemImage }]);
      }
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        wasWishlisted ? next.delete(itemId) : next.add(itemId);
        return next;
      });
      return wasWishlisted ? 'removed' : 'added';
    }

    /* Authenticated — update server + optimistic local state */
    setWishlistedIds((prev) => {
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
      setWishlistedIds((prev) => {
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
