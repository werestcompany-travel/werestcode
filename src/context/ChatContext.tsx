'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMsg {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  createdAt: number;   // epoch ms
  isStreaming?: boolean;
}

interface ChatContextValue {
  isOpen:       boolean;
  messages:     ChatMsg[];
  isStreaming:   boolean;
  unreadCount:   number;
  openChat:     () => void;
  closeChat:    () => void;
  toggleChat:   () => void;
  sendMessage:  (text: string) => Promise<void>;
  clearHistory: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY  = 'werest_chat_history';
const SESSION_KEY  = 'werest_chat_session';
const MAX_HISTORY  = 40; // messages to keep in localStorage

function genId()  { return Math.random().toString(36).slice(2, 10); }
function genSession() { return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen,      setIsOpen]      = useState(false);
  const [messages,    setMessages]    = useState<ChatMsg[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const sessionIdRef = useRef<string>('');
  const abortRef     = useRef<(() => void) | null>(null);

  // ── Load persisted history on mount ──────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMsg[];
        if (Array.isArray(parsed)) setMessages(parsed.slice(-MAX_HISTORY));
      }
      const sid = localStorage.getItem(SESSION_KEY);
      sessionIdRef.current = sid ?? genSession();
      if (!sid) localStorage.setItem(SESSION_KEY, sessionIdRef.current);
    } catch { /* ignore */ }
  }, []);

  // ── Persist messages to localStorage whenever they change ────────────────────
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
    } catch { /* ignore */ }
  }, [messages]);

  // ── Track unread messages when chat is closed ─────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const openChat  = useCallback(() => { setIsOpen(true);  setUnreadCount(0); }, []);
  const closeChat = useCallback(() => {
    setIsOpen(false);
    // Abort any ongoing stream
    abortRef.current?.();
  }, []);
  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  // ── Send a message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMsg = {
      id:        genId(),
      role:      'user',
      content:   trimmed,
      createdAt: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    // Placeholder assistant message that we'll stream into
    const assistantMsgId = genId();
    const assistantMsg: ChatMsg = {
      id:          assistantMsgId,
      role:        'assistant',
      content:     '',
      createdAt:   Date.now(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMsg]);

    let aborted = false;
    abortRef.current = () => { aborted = true; };

    try {
      // Build messages history for the API (exclude the empty placeholder)
      const history = [...messages, userMsg].map(m => ({
        role:    m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages:  history,
          pageUrl:   typeof window !== 'undefined' ? window.location.pathname : '/',
          sessionId: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = (errData as { error?: string }).error ?? 'Something went wrong. Please try again.';
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, content: errMsg, isStreaming: false }
              : m,
          ),
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (!aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // keep incomplete line

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ') && eventType) {
            try {
              const data = JSON.parse(line.slice(6));
              if (eventType === 'chunk' && typeof data.text === 'string') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: m.content + data.text }
                      : m,
                  ),
                );
              } else if (eventType === 'done') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
                  ),
                );
                if (!isOpen) setUnreadCount(c => c + 1);
                break;
              } else if (eventType === 'error') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: data.message ?? 'An error occurred.', isStreaming: false }
                      : m,
                  ),
                );
                break;
              }
            } catch { /* bad JSON line — skip */ }
            eventType = '';
          }
        }
      }

      // Ensure streaming flag cleared even if stream ended without 'done'
      setMessages(prev =>
        prev.map(m => m.id === assistantMsgId ? { ...m, isStreaming: false } : m),
      );
    } catch (err) {
      console.error('[ChatContext] send error:', err);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: 'Sorry, I couldn\'t connect. Please check your internet connection and try again.', isStreaming: false }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming, messages, isOpen]);

  return (
    <ChatContext.Provider value={{
      isOpen, messages, isStreaming, unreadCount,
      openChat, closeChat, toggleChat, sendMessage, clearHistory,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
}
