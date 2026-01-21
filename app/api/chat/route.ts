import { NextRequest } from 'next/server';
import { streamResponse } from '@/lib/mastra';
import { ChatRequest, StreamResponse } from '@/types/chat';

/**
 * AsyncGeneratorをReadableStreamに変換するヘルパー関数
 */
function iteratorToStream(iterator: AsyncGenerator<string, void, unknown>) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();

        if (done) {
          controller.close();
        } else {
          // Server-Sent Events形式でデータを送信
          const response: StreamResponse = {
            type: 'token',
            content: value,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(response)}\n\n`));
        }
      } catch (error) {
        const errorResponse: StreamResponse = {
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorResponse)}\n\n`));
        controller.close();
      }
    },
  });
}

/**
 * POSTリクエストハンドラ - チャットメッセージの処理
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディの解析
    const body: ChatRequest = await request.json();
    const { message, conversationHistory } = body;

    // バリデーション
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a non-empty string' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 会話履歴の検証
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return new Response(
        JSON.stringify({ error: 'conversationHistory must be an array' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Mastraエージェントを使用してストリーミングレスポンスを生成
    const responseStream = streamResponse(message, conversationHistory);

    // AsyncGeneratorをReadableStreamに変換
    const stream = iteratorToStream(responseStream);

    // Server-Sent Eventsとしてストリーミングレスポンスを返す
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
