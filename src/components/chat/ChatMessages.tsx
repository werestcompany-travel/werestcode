'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import ChatMessage from './ChatMessage';
import ChatWelcome from './ChatWelcome';

export default function ChatMessages() {
  const { messages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-none">
      {messages.length === 0 ? (
        <ChatWelcome />
      ) : (
        messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
