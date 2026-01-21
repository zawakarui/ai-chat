import { Agent } from '@mastra/core/agent';

/**
 * キャラクター設定（システムプロンプト）
 * エンターテイメント用のフレンドリーなAIキャラクター
 */
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
 * Mastra AIエージェントの初期化
 */
export const chatAgent = new Agent({
  id: 'ai-chat-character',
  name: 'AI Chat Character',
  instructions: CHARACTER_SYSTEM_PROMPT,
  model: 'anthropic/claude-sonnet-4-5-20250929',
});

/**
 * エージェントを使用してメッセージを生成（非ストリーミング）
 */
export async function generateResponse(
  message: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  try {
    // 会話履歴がある場合は、contextとして使用
    const contextMessages = conversationHistory
      ? conversationHistory
          .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n')
      : '';

    const fullMessage = contextMessages
      ? `Previous conversation:\n${contextMessages}\n\nUser: ${message}`
      : message;

    const response = await chatAgent.generate(fullMessage);
    return response.text || '';
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw error;
  }
}

/**
 * エージェントを使用してストリーミングレスポンスを生成
 */
export async function* streamResponse(
  message: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): AsyncGenerator<string, void, unknown> {
  try {
    // 会話履歴がある場合は、contextとして使用
    const contextMessages = conversationHistory
      ? conversationHistory
          .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n')
      : '';

    const fullMessage = contextMessages
      ? `Previous conversation:\n${contextMessages}\n\nUser: ${message}`
      : message;

    const stream = await chatAgent.stream(fullMessage);

    // textStreamを使用してストリーミングレスポンスを取得
    for await (const chunk of stream.textStream) {
      yield chunk;
    }
  } catch (error) {
    console.error('Error in streamResponse:', error);
    throw error;
  }
}
