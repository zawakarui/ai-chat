/**
 * チャットメッセージの型定義
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * チャットセッションの型定義
 */
export interface ChatSession {
  sessionId: string;
  messages: Message[];
  createdAt: string;
}

/**
 * チャットAPIリクエストの型定義
 */
export interface ChatRequest {
  message: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * ストリーミングレスポンスの型定義
 */
export interface StreamResponse {
  type: 'token' | 'done' | 'error';
  content?: string;
  error?: string;
}
