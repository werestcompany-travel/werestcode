'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getWelcomeSuggestions, getRefreshedSuggestions } from '@/lib/chat/suggestions';
import { useChat } from '@/context/ChatContext';

export default function ChatWelcome() {
  const { sendMessage } = useChat();
  const [seed, setSeed] = useState(0);

  const suggestions = seed === 0 ? getWelcomeSuggestions() : getRefreshedSuggestions(seed);

  const handleRefresh = () => {
    setSeed(s => (s + 1) % 5 || 1); // cycles 1-5
  };

  const handleSuggestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Greeting */}
      <div className="px-1 pt-2 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-[#2534ff] flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 10H8v-1c0-2.67 5.33-4 8-4v1c0 .55.45 1 1 1h1v3z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 font-poppins">Werest Concierge</p>
            <p className="text-[10px] text-green-500 font-medium">● Online</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 mt-3">
          <p className="text-sm text-gray-800 leading-relaxed font-poppins">
            Hi there! 👋 I&apos;m your AI travel concierge for Thailand. I can help you with{' '}
            <strong>transfers, tours, attractions</strong>, and all your Thailand travel questions.
          </p>
          <p className="text-sm text-gray-800 leading-relaxed font-poppins mt-2">
            What can I help you with today?
          </p>
        </div>
      </div>

      {/* Suggestions grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Suggested questions
          </p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-[11px] text-[#2534ff] hover:text-[#1a25d9] transition-colors"
            aria-label="Refresh suggestions"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {suggestions.map(({ category, colorClass, bgClass, Icon, question }) => (
            <button
              key={`${category}-${question.slice(0, 20)}`}
              onClick={() => handleSuggestion(question)}
              className="text-left bg-white border border-gray-100 rounded-xl p-3 hover:border-[#2534ff]/30 hover:shadow-sm transition-all duration-150 group"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${bgClass} ${colorClass}`}>
                  <Icon className="w-2.5 h-2.5" />
                  {category}
                </span>
              </div>
              <p className="text-[11px] text-gray-700 leading-snug group-hover:text-gray-900 transition-colors font-poppins">
                {question}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
