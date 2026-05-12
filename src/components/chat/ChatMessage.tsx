'use client';

import sanitizeHtml from 'sanitize-html';
import { type ChatMsg } from '@/context/ChatContext';
import ChatTypingIndicator from './ChatTypingIndicator';

interface Props {
  message: ChatMsg;
}

// Very light markdown-to-html: bold, bullets, links
function markdownToHtml(text: string): string {
  let html = text
    // Escape HTML entities first (before we add our own tags)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Inline links [label](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_self" rel="noopener">$1</a>')
    // Bullet lines starting with - or *
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Numbered lines starting with 1. 2. etc
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> blocks in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g, match =>
    `<ul>${match}</ul>`,
  );

  // Paragraphs: double newline → </p><p>
  html = html.replace(/\n\n+/g, '</p><p>');
  // Single newlines → <br>
  html = html.replace(/\n/g, '<br>');

  html = `<p>${html}</p>`;

  return sanitizeHtml(html, {
    allowedTags:       ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes:    ['http', 'https', '/'],
  });
}

function formatTime(epoch: number) {
  return new Date(epoch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end chat-msg-enter">
        <div className="max-w-[82%]">
          <div className="bg-[#2534ff] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed font-poppins">
            {message.content}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 text-right pr-1">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  // Assistant message
  const showTyping = message.isStreaming && message.content.length === 0;

  if (showTyping) {
    return <ChatTypingIndicator />;
  }

  return (
    <div className="flex items-start gap-2.5 chat-msg-enter">
      {/* AI avatar */}
      <div className="w-7 h-7 rounded-full bg-[#2534ff] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 10H8v-1c0-2.67 5.33-4 8-4v1c0 .55.45 1 1 1h1v3z"
            fill="white"
          />
        </svg>
      </div>

      <div className="max-w-[82%]">
        <div className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-gray-800 leading-relaxed">
          <div
            className="chat-prose"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(message.content) }}
          />
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-[#2534ff] ml-0.5 align-middle animate-pulse rounded-sm" />
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1 pl-1">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
