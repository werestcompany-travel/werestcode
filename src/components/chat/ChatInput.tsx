'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

export default function ChatInput() {
  const { sendMessage, isStreaming } = useChat();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && !isStreaming;

  const handleSend = async () => {
    if (!canSend) return;
    const msg = text.trim();
    setText('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(msg);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="border-t border-gray-100 bg-white px-3 py-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask me anything about Thailand…"
            rows={1}
            disabled={isStreaming}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2534ff]/30 focus:border-[#2534ff]/40 disabled:opacity-60 transition-all leading-relaxed font-poppins scrollbar-none"
            style={{ minHeight: 42, maxHeight: 120 }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: canSend ? '#2534ff' : '#e5e7eb' }}
        >
          <SendHorizontal
            className="w-4 h-4"
            style={{ color: canSend ? 'white' : '#9ca3af' }}
          />
        </button>
      </div>

      <p className="text-[10px] text-gray-400 mt-2 text-center leading-tight">
        AI can make mistakes. For urgent help,{' '}
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66800000000'}?text=Hi%2C%20I%20need%20help`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2534ff] underline"
        >
          chat with our team
        </a>
      </p>
    </div>
  );
}
