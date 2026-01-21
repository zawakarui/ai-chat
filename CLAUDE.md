# AIチャットボット - プロジェクト仕様書

## プロジェクト概要
- **プロジェクト名**: AIキャラクター対話チャットボット
- **目的**: エンターテイメント目的で単一キャラクターとの対話体験を提供する
- **対象ユーザー**: 誰でも利用可能（認証不要）
- **コンセプト**: ミニマルなデザインでシンプルかつ直感的なチャット体験
- **データ管理方針**: セッション中のみ会話履歴を保持（ブラウザを閉じると自動削除）

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js App Router
- **言語**: TypeScript
- **スタイリング**: CSS Modules / Tailwind CSS（選択可）
- **UI/UX**: ミニマルデザイン、レスポンシブ対応

### バックエンド
- **APIフレームワーク**: Hono
- **ランタイム**: Node.js
- **データ管理**: セッションストレージ（フロントエンド）+ メモリ（バックエンド一時保持）

### AIシステム
- **AIサービス**: Anthropic Claude API
- **AIエージェントフレームワーク**: Mastra
- **機能**: テキストベースの対話、ストリーミング応答

### インフラ・デプロイ
- **デプロイ先**: Google Cloud Run
- **コンテナ化**: Docker
- **環境変数管理**: .env ファイル（gitignoreに追加必須）

## 主要機能

### 1. チャット機能
- テキストベースの対話インターフェース
- リアルタイムストリーミング応答（文字が1文字ずつ表示される）
- 単一キャラクター固定（キャラクター設定はシステムプロンプトで定義）
- メッセージ送信時のローディング状態表示

### 2. 会話履歴管理
- セッション中のみ会話履歴を保持（ブラウザを閉じると削除）
- フロントエンドの sessionStorage で会話データを管理
- ブラウザリロード時は履歴を復元可能（タブを閉じるまで）
- タブ・ブラウザを閉じると自動的に全履歴がクリアされる

### 3. UI/UX
- ミニマルで洗練されたデザイン
- モバイル・タブレット・デスクトップ対応（レスポンシブ）
- シンプルな入力フォーム
- メッセージの送受信が明確に分かるUI

## アーキテクチャ設計

### ディレクトリ構成
```
ai-chat/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (Hono統合)
│   │   │   ├── chat/          # チャット関連API
│   │   │   └── health/        # ヘルスチェック
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx           # メインページ
│   ├── components/            # React コンポーネント
│   │   ├── Chat/              # チャット関連コンポーネント
│   │   ├── Message/           # メッセージ表示コンポーネント
│   │   └── Input/             # 入力フォームコンポーネント
│   ├── lib/                   # ユーティリティ・ライブラリ
│   │   ├── mastra.ts          # Mastra エージェント設定
│   │   ├── claude.ts          # Claude API クライアント
│   │   └── session.ts         # セッション管理ユーティリティ
│   ├── types/                 # TypeScript 型定義
│   └── styles/                # スタイルファイル
├── public/                    # 静的ファイル
├── .env.example               # 環境変数のテンプレート
├── .gitignore
├── Dockerfile                 # Cloud Run用Dockerfile
├── package.json
├── tsconfig.json
└── CLAUDE.md                  # この仕様書
```

### データ構造（TypeScript）
```typescript
// セッションストレージに保存される会話履歴の型定義
interface Message {
  id: string;              // ユニークID（UUID等）
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;       // ISO 8601形式
}

interface ChatSession {
  sessionId: string;       // セッションID（UUID等）
  messages: Message[];
  createdAt: string;       // ISO 8601形式
}

// sessionStorageのキー: 'chatSession'
// 値: JSON.stringify(ChatSession)
```

**データ保持の仕組み**:
- フロントエンドの `sessionStorage` に会話履歴を保存
- ブラウザリロード時は sessionStorage から復元
- タブ/ブラウザを閉じると自動的に削除される
- 永続化は行わない（データベース不要）

### API設計

#### POST /api/chat
- **リクエスト**:
  ```json
  {
    "message": "ユーザーのメッセージ",
    "conversationHistory": [
      {
        "role": "user",
        "content": "こんにちは"
      },
      {
        "role": "assistant",
        "content": "こんにちは！"
      }
    ]
  }
  ```
  - `conversationHistory`: フロントエンドから送信される会話履歴（コンテキスト用）

- **レスポンス**: Server-Sent Events (SSE) でストリーミング
  ```
  data: {"type": "token", "content": "こ"}
  data: {"type": "token", "content": "ん"}
  data: {"type": "token", "content": "に"}
  data: {"type": "done"}
  ```

**注意**:
- バックエンドはデータを保存しない
- 会話履歴はフロントエンドが管理し、毎回リクエストに含める
- セッションIDは不要（状態を保持しないステートレス設計）

### AIエージェント設計（Mastra）
- **キャラクター設定**: システムプロンプトで固定キャラクターの性格・口調・設定を定義
- **コンテキスト管理**: 会話履歴を含めてClaude APIに送信
- **ストリーミング対応**: Claude APIのストリーミングレスポンスをそのままフロントエンドに転送

## 環境変数

### 必須環境変数
```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 開発時の注意事項

### Git管理
- **ブランチ戦略**: 必ず feature ブランチを作成して作業
  - 新機能: `feat-<機能名>`
  - バグ修正: `fix-<修正内容>`
- **main ブランチへの直接コミット禁止**
- 作業完了後は必ず PR を作成してレビュー

### コミット前の確認事項
1. ローカルで動作確認を実施
2. エラーがないことを確認
3. 環境変数ファイル（.env）がコミット対象外であることを確認
4. 不要なコンソールログを削除

### セキュリティ
- APIキー等の機密情報は必ず環境変数で管理
- `.env` ファイルは `.gitignore` に必ず追加
- フロントエンドからAPIキーを直接使用しない（必ずバックエンド経由）
- セッションストレージには機密情報を保存しない

### コード品質
- TypeScript の型定義を適切に行う
- ESLint / Prettier でコードフォーマットを統一
- コンポーネントは責務ごとに分割
- 過度な抽象化は避け、シンプルに保つ

## デプロイ手順（Google Cloud Run）

### 1. Dockerイメージのビルド
```bash
docker build -t gcr.io/[PROJECT-ID]/ai-chat .
```

### 2. Google Container Registryへのプッシュ
```bash
docker push gcr.io/[PROJECT-ID]/ai-chat
```

### 3. Cloud Runへのデプロイ
```bash
gcloud run deploy ai-chat \
  --image gcr.io/[PROJECT-ID]/ai-chat \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=xxx
```

### 4. 環境変数の設定
- Cloud RunのコンソールまたはCLIで環境変数を設定
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`（デプロイ後のURL）

## 今後の拡張候補
- 会話履歴の永続化（MongoDB等のデータベースに保存）
- 複数キャラクター対応（キャラクター選択機能）
- ユーザー認証機能（Google OAuth等）
- 会話のエクスポート機能（JSON/テキスト）
- ダークモード対応
- 画像アップロード・解析機能（マルチモーダル）
- 音声入力・読み上げ機能

## 参考リンク
- [Next.js App Router ドキュメント](https://nextjs.org/docs)
- [Hono ドキュメント](https://hono.dev/)
- [Mastra ドキュメント](https://mastra.ai/docs)
- [Anthropic Claude API ドキュメント](https://docs.anthropic.com/)
- [Google Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [sessionStorage API ドキュメント](https://developer.mozilla.org/ja/docs/Web/API/Window/sessionStorage)
