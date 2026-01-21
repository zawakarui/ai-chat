import { NextResponse } from 'next/server';

/**
 * GETリクエストハンドラ - ヘルスチェック
 */
export async function GET() {
  try {
    // 環境変数の確認
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

    // システム状態の確認
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        hasAnthropicApiKey: hasApiKey,
      },
    };

    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
