'use client';

import { useEffect, useState } from 'react';
import { X, Bot } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

export default function ChatLauncher() {
  const { isOpen, toggleChat, unreadCount } = useChat();
  const [showLabel, setShowLabel] = useState(false);

  // Show "Ask Werest AI" label on first visit for 6 seconds
  useEffect(() => {
    const seen = sessionStorage.getItem('werest_chat_label_seen');
    if (!seen) {
      const t = setTimeout(() => {
        setShowLabel(true);
        sessionStorage.setItem('werest_chat_label_seen', '1');
        setTimeout(() => setShowLabel(false), 6000);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[55] flex flex-col items-end gap-2">
      {/* Tooltip label */}
      {showLabel && !isOpen && (
        <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-lg rounded-full px-4 py-2 chat-msg-enter">
          <span className="text-sm font-medium text-gray-800 font-poppins whitespace-nowrap">
            Ask Werest AI ✨
          </span>
        </div>
      )}

      {/* Launcher button */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-[1.08] focus:outline-none focus:ring-2 focus:ring-[#2534ff]/40 focus:ring-offset-2"
        style={{ background: '#2534ff', boxShadow: '0 4px 20px rgba(37,52,255,0.35)' }}
      >
        {/* Pulse ring — only when closed */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full chat-launcher-pulse"
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
