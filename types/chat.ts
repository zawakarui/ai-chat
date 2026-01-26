/**
 * チャットメッセージの型定義
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageData?: string;     // base64エンコード画像
  imageName?: string;     // ファイル名
  imageType?: string;     // MIMEタイプ (image/jpeg, image/png, etc.)
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
    imageData?: string;
    imageType?: string;
  }>;
  imageData?: string;     // 送信する画像のbase64データ
  imageType?: string;     // 送信する画像のMIMEタイプ
}

/**
 * ストリーミングレスポンスの型定義
 */
export interface StreamResponse {
  type: 'token' | 'done' | 'error';
  content?: string;
  error?: string;
}
