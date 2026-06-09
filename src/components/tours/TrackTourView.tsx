'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';

interface Props {
  id: string;
  title: string;
  image: string;
  href: string;
  price?: string;
  location?: string;
}

export default function TrackTourView({ id, title, image, href, price, location }: Props) {
  const { addItem } = useRecentlyViewed();

  useEffect(() => {
    addItem({ id, type: 'tour', title, image, href, price, location });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
