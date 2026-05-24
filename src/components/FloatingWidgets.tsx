'use client';
import { usePathname } from 'next/navigation';
import ChatWidget from './chat/ChatWidget';
import PWAInstallPrompt from './PWAInstallPrompt';

export default function FloatingWidgets() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <>
      <ChatWidget />
      <PWAInstallPrompt />
    </>
  );
}
