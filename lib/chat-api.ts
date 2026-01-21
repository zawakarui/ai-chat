import { ChatRequest, StreamResponse } from '@/types/chat';

/**
 * チャットAPIにメッセージを送信してストリーミングレスポンスを受信
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const requestBody: ChatRequest = {
      message,
      conversationHistory,
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Server-Sent Eventsをパース
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // デコードして buffer に追加
      buffer += decoder.decode(value, { stream: true });

      // SSE形式のデータを行ごとに処理
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 最後の不完全な行は buffer に残す

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6); // "data: " を除去

          try {
            const data: StreamResponse = JSON.parse(jsonStr);

            if (data.type === 'token' && data.content) {
              onToken(data.content);
            } else if (data.type === 'error') {
              onError(data.error || 'Unknown error');
              return;
            }
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError);
          }
        }
      }
    }

    // ストリーミング完了
    onComplete();
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    onError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}
