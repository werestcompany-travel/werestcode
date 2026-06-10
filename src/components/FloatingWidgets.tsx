'use client';
import { usePathname } from 'next/navigation';
import PWAInstallPrompt from './PWAInstallPrompt';

export default function FloatingWidgets() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return <PWAInstallPrompt />;
}
