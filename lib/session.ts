import { v4 as uuidv4 } from 'uuid';
import { ChatSession, Message } from '@/types/chat';

const SESSION_STORAGE_KEY = 'chatSession';

/**
 * セッションIDを生成
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * セッションストレージから会話履歴を読み込む
 */
export function loadSession(): ChatSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionData) {
      return null;
    }

    const session: ChatSession = JSON.parse(sessionData);
    return session;
  } catch (error) {
    console.error('Failed to load session from sessionStorage:', error);
    return null;
  }
}

/**
 * セッションストレージに会話履歴を保存
 */
export function saveSession(session: ChatSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const sessionData = JSON.stringify(session);
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionData);
  } catch (error) {
    console.error('Failed to save session to sessionStorage:', error);
  }
}

/**
 * 新しいセッションを初期化
 */
export function initializeSession(): ChatSession {
  const session: ChatSession = {
    sessionId: generateSessionId(),
    messages: [],
    createdAt: new Date().toISOString(),
  };

  saveSession(session);
  return session;
}

/**
 * セッションにメッセージを追加
 */
export function addMessage(
  session: ChatSession,
  role: 'user' | 'assistant',
  content: string
): ChatSession {
  const newMessage: Message = {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date().toISOString(),
  };

  const updatedSession: ChatSession = {
    ...session,
    messages: [...session.messages, newMessage],
  };

  saveSession(updatedSession);
  return updatedSession;
}

/**
 * セッションストレージをクリア
 */
export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session from sessionStorage:', error);
  }
}

/**
 * セッションが存在するかチェック
 */
export function hasSession(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return sessionStorage.getItem(SESSION_STORAGE_KEY) !== null;
}
