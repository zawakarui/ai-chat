import { NextRequest } from 'next/server';
import { streamChatCompletion } from '@/lib/claude';
import { ChatRequest, StreamResponse } from '@/types/chat';

const CHARACTER_SYSTEM_PROMPT = `あなたは親しみやすく、楽しい会話を提供するAIキャラクターです。

性格と振る舞い:
- フレンドリーで温かみのある口調で話します
- ユーザーの話に興味を持ち、共感的に応答します
- 適度にユーモアを交えた会話を心がけます
- 簡潔でわかりやすい表現を使用します

会話のガイドライン:
- ユーザーの質問や話題に真摯に向き合います
- 押し付けがましくならず、自然な会話を心がけます
- 必要に応じて質問を返して会話を深めます
- ポジティブで前向きな雰囲気を大切にします

あなたの役割は、ユーザーとの楽しく有意義な対話を通じて、
エンターテイメント性のある体験を提供することです。`;

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
    const { message, conversationHistory, imageData, imageType } = body;

    // バリデーション: メッセージまたは画像のどちらかが必要
    if ((!message || typeof message !== 'string' || message.trim() === '') && !imageData) {
      return new Response(
        JSON.stringify({ error: 'Message or image is required' }),
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

    // 画像データの検証
    if (imageData && !imageType) {
      return new Response(
        JSON.stringify({ error: 'imageType is required when imageData is provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 新しいメッセージを作成（現在のユーザーメッセージ）
    const currentMessage = {
      role: 'user' as const,
      content: message || '',
      imageData,
      imageType,
    };

    // 会話履歴に新しいメッセージを追加
    const allMessages = conversationHistory
      ? [...conversationHistory.slice(0, -1), currentMessage] // 最後のメッセージ（現在送信したもの）を置き換え
      : [currentMessage];

    // Claude APIを使用してストリーミングレスポンスを生成
    const responseStream = streamChatCompletion(allMessages, CHARACTER_SYSTEM_PROMPT);

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
