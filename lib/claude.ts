import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic Claudeクライアントの初期化
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Claude APIへメッセージを送信してストリーミングレスポンスを取得
 */
export async function* streamChatCompletion(
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    imageData?: string;
    imageType?: string
  }>,
  systemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  try {
    // メッセージを Claude API のマルチモーダル形式に変換
    const formattedMessages = messages.map((msg) => {
      if (msg.imageData && msg.imageType) {
        // 画像を含むメッセージ
        const content: Array<any> = [];

        // 画像を追加
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: msg.imageType,
            data: msg.imageData,
          },
        });

        // テキストがある場合は追加
        if (msg.content) {
          content.push({
            type: 'text',
            text: msg.content,
          });
        }

        return {
          role: msg.role,
          content,
        };
      } else {
        // テキストのみのメッセージ
        return {
          role: msg.role,
          content: msg.content,
        };
      }
    });

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: systemPrompt || 'You are a helpful AI assistant.',
      messages: formattedMessages,
    });

    // ストリーミングイベントを処理
    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      }
    }
  } catch (error) {
    console.error('Error in streamChatCompletion:', error);
    throw error;
  }
}

/**
 * Claude APIへメッセージを送信（非ストリーミング）
 */
export async function sendMessage(
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    imageData?: string;
    imageType?: string
  }>,
  systemPrompt?: string
): Promise<string> {
  try {
    // メッセージを Claude API のマルチモーダル形式に変換
    const formattedMessages = messages.map((msg) => {
      if (msg.imageData && msg.imageType) {
        // 画像を含むメッセージ
        const content: Array<any> = [];

        // 画像を追加
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: msg.imageType,
            data: msg.imageData,
          },
        });

        // テキストがある場合は追加
        if (msg.content) {
          content.push({
            type: 'text',
            text: msg.content,
          });
        }

        return {
          role: msg.role,
          content,
        };
      } else {
        // テキストのみのメッセージ
        return {
          role: msg.role,
          content: msg.content,
        };
      }
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: systemPrompt || 'You are a helpful AI assistant.',
      messages: formattedMessages,
    });

    // テキストコンテンツを抽出
    const textContent = response.content.find((block) => block.type === 'text');
    return textContent && textContent.type === 'text' ? textContent.text : '';
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}
