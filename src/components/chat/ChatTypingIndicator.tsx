'use client';

export default function ChatTypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 chat-msg-enter">
      {/* AI avatar */}
      <div className="w-7 h-7 rounded-full bg-[#2534ff] flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
            fill="white" opacity="0.9"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>
      </div>

      {/* Bubble */}
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full inline-block"
              style={{ animation: `typingDot 1.3s ease-in-out ${i * 0.22}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
