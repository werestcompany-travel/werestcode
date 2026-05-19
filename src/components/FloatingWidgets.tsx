'use client';
import { usePathname } from 'next/navigation';
import WhatsAppFloat from './WhatsAppFloat';
import ChatWidget from './chat/ChatWidget';

export default function FloatingWidgets() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <>
      <WhatsAppFloat />
      <ChatWidget />
    </>
  );
}
