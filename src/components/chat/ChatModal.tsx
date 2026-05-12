'use client';

import { Minimize2, Trash2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

export default function ChatModal() {
  const { isOpen, closeChat, clearHistory, messages } = useChat();

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-[54] bg-black/20 md:hidden"
        onClick={closeChat}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-label="Werest AI Concierge"
        aria-modal="true"
        className={[
          'fixed z-[55] bg-white flex flex-col overflow-hidden chat-modal-enter',
          // Mobile: full-screen
          'inset-0',
          // Desktop: fixed panel bottom-right
          'md:inset-auto md:bottom-[84px] md:right-6 md:w-[380px] md:h-[600px] md:rounded-2xl',
        ].join(' ')}
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2534ff 0%, #1a25d9 100%)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 10H8v-1c0-2.67 5.33-4 8-4v1c0 .55.45 1 1 1h1v3z"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none font-poppins">
                Werest Concierge
              </p>
              <p className="text-[10px] text-white/70 mt-0.5">AI Travel Assistant · Thailand</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                aria-label="Clear chat history"
                title="Clear conversation"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={closeChat}
              aria-label="Minimize chat"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <ChatMessages />

        {/* Input */}
        <ChatInput />
      </div>
    </>
  );
}
