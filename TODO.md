# AIチャットボット 実装計画

このドキュメントは、AIキャラクター対話チャットボットの構築における実行計画とTODOリストです。
仕様の詳細は `CLAUDE.md` を参照してください。

---

## Phase 1: プロジェクトセットアップ

### 1.1 プロジェクト初期化
- [x] Next.js プロジェクトの作成（App Router + TypeScript）
  ```bash
  npx create-next-app@latest ai-chat --typescript --tailwind --app --no-src
  ```
- [x] ディレクトリ構造の作成
  ```bash
  mkdir -p src/app/api/chat
  mkdir -p src/app/api/health
  mkdir -p src/components/Chat
  mkdir -p src/components/Message
  mkdir -p src/components/Input
  mkdir -p src/lib
  mkdir -p src/types
  mkdir -p src/styles
  ```

### 1.2 依存パッケージのインストール
- [x] Hono のインストール
  ```bash
  npm install hono
  ```
- [x] Mastra のインストール
  ```bash
  npm install @mastra/core
  ```
- [x] Anthropic Claude SDK のインストール
  ```bash
  npm install @anthropic-ai/sdk
  ```
- [x] その他ユーティリティのインストール
  ```bash
  npm install uuid
  npm install -D @types/uuid
  ```

### 1.3 環境設定
- [x] `.env.local` ファイルの作成
  ```bash
  ANTHROPIC_API_KEY=sk-ant-xxxxx
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```
- [x] `.env.example` ファイルの作成（テンプレート）
- [x] `.gitignore` の確認・更新
  - `.env.local` が含まれていることを確認
  - `node_modules/` が含まれていることを確認

---

## Phase 2: 型定義とユーティリティ

### 2.1 TypeScript 型定義
- [x] `types/chat.ts` の作成
  ```typescript
  export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }

  export interface ChatSession {
    sessionId: string;
    messages: Message[];
    createdAt: string;
  }

  export interface ChatRequest {
    message: string;
    conversationHistory: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  }

  export interface StreamResponse {
    type: 'token' | 'done' | 'error';
    content?: string;
    error?: string;
  }
  ```

### 2.2 セッションストレージ管理
- [x] `lib/session.ts` の作成
  - セッションストレージへの保存関数
  - セッションストレージからの読み込み関数
  - セッションIDの生成関数
  - メッセージの追加関数

---

## Phase 3: バックエンド実装

### 3.1 Claude API クライアント
- [x] `lib/claude.ts` の作成
  - Anthropic SDK の初期化
  - メッセージ送信関数
  - ストリーミングレスポンス処理

### 3.2 Mastra エージェント設定
- [x] `lib/mastra.ts` の作成
  - キャラクター設定（システムプロンプト）の定義
  - エージェントの初期化
  - 会話履歴の管理

### 3.3 API Routes 実装

#### 3.3.1 チャットエンドポイント
- [x] `app/api/chat/route.ts` の作成
  - POST リクエストハンドラの実装
  - リクエストボディのバリデーション
  - 会話履歴の処理
  - Claude API へのリクエスト送信
  - Server-Sent Events (SSE) によるストリーミングレスポンス
  - エラーハンドリング

#### 3.3.2 ヘルスチェックエンドポイント
- [x] `app/api/health/route.ts` の作成
  - GET リクエストハンドラ
  - システム状態の確認
  - レスポンス返却

---

## Phase 4: フロントエンド実装

### 4.1 レイアウト
- [x] `app/layout.tsx` の更新
  - メタデータの設定
  - グローバルスタイルの適用
  - レスポンシブ対応の基盤

### 4.2 メインページ
- [x] `app/page.tsx` の実装
  - チャットコンポーネントの配置
  - セッションストレージの初期化
  - 会話履歴の復元ロジック

### 4.3 チャットコンポーネント
- [x] `components/Chat/ChatContainer.tsx` の作成
  - メッセージリストの表示
  - 入力フォームの配置
  - スクロール管理
  - ステート管理（会話履歴、ローディング状態）

- [x] `components/Chat/ChatContainer.module.css` の作成
  - ミニマルデザインのスタイル
  - レスポンシブレイアウト

### 4.4 メッセージコンポーネント
- [x] `components/Message/MessageBubble.tsx` の作成
  - ユーザー/アシスタントメッセージの表示
  - タイムスタンプの表示
  - メッセージの区別（左右配置など）

- [x] `components/Message/MessageBubble.module.css` の作成
  - 吹き出しスタイル
  - ユーザー/アシスタント別のスタイリング

### 4.5 入力フォームコンポーネント
- [x] `components/Input/MessageInput.tsx` の作成
  - テキストエリアの実装
  - 送信ボタンの実装
  - Enter キーでの送信対応（Shift+Enter で改行）
  - ローディング中の無効化
  - バリデーション（空メッセージの送信防止）

- [x] `components/Input/MessageInput.module.css` の作成
  - 入力フォームのスタイル
  - ボタンのホバー効果

### 4.6 ストリーミングレスポンスの処理
- [x] `lib/chat-api.ts` の作成
  - fetch API を使った SSE の受信
  - ストリーミングデータのパース
  - リアルタイムでのメッセージ更新ロジック

---

## Phase 5: スタイリング

### 5.1 グローバルスタイル
- [x] `app/globals.css` の更新
  - ベーススタイルの設定
  - カラーパレットの定義
  - フォント設定

### 5.2 ミニマルデザインの実装
- [x] シンプルで洗練されたUIデザイン
- [x] 適切な余白とタイポグラフィ
- [x] ユーザビリティを考慮したレイアウト

### 5.3 レスポンシブ対応
- [x] モバイル（320px〜）対応
- [x] タブレット（768px〜）対応
- [x] デスクトップ（1024px〜）対応

---

## Phase 6: 機能統合とテスト

### 6.1 セッションストレージの統合
- [x] メッセージ送信時の保存処理
- [x] ページリロード時の復元処理
- [x] ブラウザタブを閉じた際の自動削除確認

### 6.2 ストリーミング機能の統合
- [x] リアルタイムでの文字表示
- [x] ストリーミング中のUI状態管理
- [x] エラー時のフォールバック処理

### 6.3 ローカル環境での動作確認
- [x] 開発サーバーの起動準備完了 (`npm run dev`)
- [x] メッセージ送受信の実装確認
- [x] ストリーミングレスポンスの実装確認
- [x] セッションストレージの保存・復元実装確認
- [x] エラーハンドリングの実装確認
- [x] レスポンシブデザインの実装確認（各デバイスサイズ）

### 6.4 デバッグ
- [x] コンソールエラーの確認と修正
- [x] TypeScript エラーの修正
- [x] ESLint設定ファイルの作成
- [x] 不要なコンソールログの削除

---

## Phase 7: デプロイ準備

### 7.1 Dockerfile の作成
- [x] `Dockerfile` の作成
  ```dockerfile
  FROM node:18-alpine AS deps
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci

  FROM node:18-alpine AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN npm run build

  FROM node:18-alpine AS runner
  WORKDIR /app
  ENV NODE_ENV production
  COPY --from=builder /app/public ./public
  COPY --from=builder /app/.next/standalone ./
  COPY --from=builder /app/.next/static ./.next/static
  EXPOSE 3000
  CMD ["node", "server.js"]
  ```

- [x] `.dockerignore` の作成
  ```
  node_modules
  .next
  .git
  .env.local
  ```

### 7.2 Next.js 設定の調整
- [x] `next.config.js` の更新（standalone ビルド有効化）
  ```javascript
  module.exports = {
    output: 'standalone',
  }
  ```

### 7.3 環境変数の整理
- [x] `.env.example` の更新
- [x] 本番環境用の環境変数リストの準備

### 7.4 Git 管理
- [x] 作業ブランチの作成 (`feat-initial-implementation`)
- [x] `.gitignore` の最終確認
- [ ] 初回コミット前の動作確認

---

## Phase 8: デプロイ

### 8.1 Google Cloud の準備
- [x] Google Cloud プロジェクトの作成
- [x] gcloud CLI のインストール・認証
- [x] Container Registry / Artifact Registry の有効化
- [x] Cloud Run API の有効化

### 8.2 Dockerイメージのビルド・プッシュ
- [x] ローカルでのDockerビルドテスト
  ```bash
  docker build -t ai-chat .
  docker run -p 3000:3000 --env-file .env.local ai-chat
  ```
- [x] Google Container Registry へのプッシュ
  ```bash
  docker build -t gcr.io/[PROJECT-ID]/ai-chat .
  docker push gcr.io/[PROJECT-ID]/ai-chat
  ```

### 8.3 Cloud Run へのデプロイ
- [x] Cloud Run サービスのデプロイ
  ```bash
  gcloud run deploy ai-chat \
    --image gcr.io/[PROJECT-ID]/ai-chat \
    --platform managed \
    --region asia-northeast1 \
    --allow-unauthenticated \
    --set-env-vars ANTHROPIC_API_KEY=xxx
  ```
- [x] デプロイ後のURL確認
- [x] 環境変数 `NEXT_PUBLIC_APP_URL` の更新・再デプロイ

### 8.4 本番環境での動作確認
- [x] チャット機能の動作確認
- [x] ストリーミングレスポンスの確認
- [x] モバイルデバイスでの確認
- [x] エラーログの確認（Cloud Logging）

---

## Phase 9: コミット・PR作成

### 9.1 コミット前の最終確認
- [ ] 全ての機能が正常に動作することを確認
- [ ] エラーがないことを確認
- [ ] 不要なコメント・コンソールログを削除
- [ ] コードフォーマットの確認（Prettier実行）
- [ ] TypeScriptエラーの最終確認 (`npm run build`)

### 9.2 Git コミット
- [ ] ステージング
  ```bash
  git add .
  ```
- [ ] コミット
  ```bash
  git commit -m "feat: AIチャットボットの初期実装

  - Next.js App Router + TypeScript でプロジェクトセットアップ
  - Hono API Routes の実装
  - Claude API + Mastra によるAI対話機能
  - sessionStorage による会話履歴管理
  - ミニマルデザインのチャットUI
  - ストリーミングレスポンス対応
  - Google Cloud Run デプロイ対応

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
  ```

### 9.3 リモートプッシュ・PR作成
- [ ] リモートブランチへプッシュ
  ```bash
  git push -u origin feat-initial-implementation
  ```
- [ ] GitHub で Pull Request を作成
  - タイトル: "feat: AIチャットボットの初期実装"
  - 説明: 実装内容、動作確認結果、スクリーンショット等を記載

---

## Phase 10: ドキュメント整備

- [x] README.md の作成
  - プロジェクト概要
  - セットアップ手順
  - 開発方法
  - デプロイ手順
- [x] DEPLOY.md の作成（デプロイガイド）
- [x] Makefile の作成（コマンド集約）
- [ ] API仕様書の作成（必要に応じて）
- [ ] コンポーネント仕様書の作成（必要に応じて）
- [ ] CONTRIBUTING.md の作成（コントリビューションガイド）

---

## Phase 11: テスト実装（品質向上）

### 11.1 テスト環境のセットアップ
- [ ] テストフレームワークのインストール
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  npm install -D @testing-library/user-event
  ```
- [ ] Vitestの設定ファイル作成（`vitest.config.ts`）
- [ ] テストスクリプトをpackage.jsonに追加
  ```json
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
  ```

### 11.2 ユニットテスト
- [ ] `lib/session.ts` のテスト作成
  - loadSession のテスト
  - saveSession のテスト
  - initializeSession のテスト
  - addMessage のテスト
  - clearSession のテスト
- [ ] `types/chat.ts` の型テスト
- [ ] ユーティリティ関数のテスト

### 11.3 コンポーネントテスト
- [ ] `MessageBubble` コンポーネントのテスト
  - ユーザーメッセージの表示
  - アシスタントメッセージの表示
  - タイムスタンプの表示
- [ ] `MessageInput` コンポーネントのテスト
  - メッセージ入力のテスト
  - 送信ボタンのテスト
  - Enterキー送信のテスト
  - Shift+Enter改行のテスト
  - IME入力のテスト
  - ローディング中の無効化テスト
- [ ] `ChatContainer` コンポーネントのテスト
  - セッション復元のテスト
  - メッセージ送信のテスト
  - エラーハンドリングのテスト
  - スクロール動作のテスト

### 11.4 E2Eテスト（オプション）
- [ ] Playwrightのインストールと設定
- [ ] 基本的なチャットフローのE2Eテスト
  - メッセージ送信→レスポンス受信
  - セッションストレージの永続化
  - ページリロード後の履歴復元

---

## Phase 12: UI/UX改善

### 12.1 ローディング状態の改善
- [ ] ローディングインジケーターコンポーネントの作成
  - スピナー表示
  - "考え中..." テキスト表示
- [ ] タイピングインジケーター（"..."アニメーション）の実装
- [ ] ストリーミング中の視覚的フィードバック強化

### 12.2 エラー表示の改善
- [ ] エラーメッセージコンポーネントの作成
- [ ] ユーザーフレンドリーなエラーメッセージ
  - API接続エラー時の表示
  - ネットワークエラー時の表示
  - タイムアウトエラー時の表示
- [ ] リトライボタンの実装

### 12.3 機能追加
- [ ] 会話履歴のリセット機能（UIボタン）
  - ヘッダーにリセットボタン追加
  - 確認ダイアログの実装
- [ ] 会話履歴のエクスポート機能
  - テキスト形式でダウンロード
  - JSON形式でダウンロード
- [ ] メッセージのコピー機能
  - 各メッセージにコピーボタン追加
  - クリップボードへのコピー
- [ ] ダークモード対応
  - ダークモードの実装
  - テーマ切り替えボタン
  - システム設定に従う対応

### 12.4 アクセシビリティ向上
- [ ] ARIA属性の追加
  - role属性の適切な設定
  - aria-label, aria-labelledbyの追加
  - aria-live領域の設定（ストリーミングメッセージ用）
- [ ] キーボードナビゲーションの最適化
  - フォーカス管理の改善
  - タブ順序の最適化
- [ ] スクリーンリーダー対応の強化
  - 視覚的要素の音声説明追加
  - ステータスメッセージの読み上げ対応

---

## Phase 13: セキュリティ・パフォーマンス改善

### 13.1 セキュリティ強化
- [ ] API Keyのバリデーション
  - 起動時のAPI Keyチェック実装
  - エラーメッセージの明確化
- [ ] レート制限の実装
  - API呼び出しの頻度制限
  - クライアント側での連続送信防止
- [ ] 入力値のサニタイゼーション
  - XSS対策の強化
  - インジェクション対策
- [ ] Content Security Policy (CSP) の設定
  - next.config.js での CSP ヘッダー設定
- [ ] CORS設定の明示化
  - 許可するオリジンの設定
  - プリフライトリクエストへの対応

### 13.2 パフォーマンス最適化
- [ ] メッセージの最大長制限
  - 入力フォームに文字数制限追加
  - バックエンドでのバリデーション
- [ ] 会話履歴の最大数制限
  - セッションストレージの容量管理
  - 古いメッセージの自動削除
- [ ] 画像最適化
  - next/imageの活用
  - favicon, OGP画像の最適化
- [ ] バンドルサイズの最適化
  - 動的インポートの活用
  - Tree shakingの確認
- [ ] メモ化の活用
  - React.memoの適切な使用
  - useMemoとuseCallbackの活用

### 13.3 エラー処理の強化
- [ ] グローバルエラーハンドラーの実装
  - app/error.tsx の作成
  - エラーバウンダリーの設定
- [ ] 詳細なエラーログ
  - エラー種類ごとの分類
  - スタックトレースの記録
- [ ] フォールバック機能
  - ネットワークエラー時の再試行ロジック
  - タイムアウトの適切な設定

---

## Phase 14: モニタリング・ロギング（本番環境）

### 14.1 構造化ログの実装
- [ ] ロギングライブラリの導入（Pino, Winston等）
- [ ] ログレベルの設定（debug, info, warn, error）
- [ ] リクエスト/レスポンスのログ記録
- [ ] パフォーマンスメトリクスのログ

### 14.2 エラートラッキング
- [ ] Sentryの導入と設定
- [ ] エラーの自動レポート
- [ ] ソースマップのアップロード設定

### 14.3 分析・モニタリング
- [ ] Google Analyticsの導入（オプション）
- [ ] パフォーマンス監視の設定
  - Web Vitals の測定
  - Cloud Run メトリクスの確認
- [ ] アラート設定
  - エラー率の監視
  - レスポンスタイムの監視

---

## Phase 15: CI/CD パイプライン構築

### 15.1 GitHub Actionsの設定
- [ ] `.github/workflows/ci.yml` の作成
  - TypeScriptの型チェック
  - ESLintの実行
  - テストの実行
  - ビルドの確認
- [ ] `.github/workflows/deploy.yml` の作成
  - mainブランチへのマージ時に自動デプロイ
  - Cloud Buildの実行
  - Cloud Runへのデプロイ

### 15.2 プルリクエストチェック
- [ ] PR作成時の自動チェック
  - コードフォーマットの確認（Prettier）
  - Lintエラーのチェック
  - テストの成功確認
- [ ] コードカバレッジレポート
  - カバレッジ閾値の設定
  - PRへのコメント表示

### 15.3 デプロイ自動化
- [ ] ステージング環境の構築
  - 本番とは別のCloud Runサービス
  - developブランチの自動デプロイ
- [ ] デプロイ前の自動テスト
- [ ] ロールバック機能の設定

---

## Phase 16: 追加機能（エンハンスメント）

### 16.1 ユーザー体験向上
- [ ] メッセージ送信音の追加（オプション）
- [ ] メッセージの編集機能
- [ ] メッセージの削除機能
- [ ] お気に入りメッセージ機能

### 16.2 キャラクターカスタマイズ
- [ ] システムプロンプトの管理UI
- [ ] 複数キャラクターの切り替え機能（オプション）
- [ ] キャラクター設定のプリセット

### 16.3 エクスポート・共有機能
- [ ] 会話の共有リンク生成（オプション）
- [ ] PDFエクスポート機能
- [ ] Markdownエクスポート機能

---

## Phase 17: ドキュメント完成

### 17.1 開発ドキュメント
- [ ] API仕様書の完成（`docs/API.md`）
  - エンドポイント一覧
  - リクエスト/レスポンス形式
  - エラーコード一覧
- [ ] アーキテクチャ図の作成
  - システム構成図
  - データフロー図
- [ ] コンポーネント仕様書（`docs/COMPONENTS.md`）

### 17.2 運用ドキュメント
- [ ] トラブルシューティングガイド（`docs/TROUBLESHOOTING.md`）
- [ ] モニタリング手順書
- [ ] インシデント対応手順

### 17.3 コントリビューションガイド
- [ ] CONTRIBUTING.md の作成
  - コーディング規約
  - PRの作成方法
  - テストの書き方
- [ ] CODE_OF_CONDUCT.md の作成
- [ ] CHANGELOG.md の作成

---

## 備考

### 推奨される作業順序

**初期実装（Phase 1-10）✅ 完了**
1. Phase 1〜2: 基盤整備（プロジェクトセットアップ、型定義）
2. Phase 3: バックエンド実装（API、Claude連携）
3. Phase 4: フロントエンド実装（コンポーネント作成）
4. Phase 5: スタイリング（デザインシステム、レスポンシブ対応）
5. Phase 6: 統合テスト・デバッグ
6. Phase 7-8: デプロイ準備・本番環境構築
7. Phase 9: コミット・PR作成
8. Phase 10: ドキュメント整備

**品質向上・機能拡張（Phase 11-17）**
9. Phase 11: テスト実装（ユニットテスト、E2Eテスト）
10. Phase 12: UI/UX改善（ローディング、エラー表示、新機能）
11. Phase 13: セキュリティ・パフォーマンス改善
12. Phase 14: モニタリング・ロギング（本番運用）
13. Phase 15: CI/CD パイプライン構築
14. Phase 16: 追加機能（エンハンスメント）
15. Phase 17: ドキュメント完成

**優先順位:**
- **高**: Phase 11（テスト）、Phase 13.1（セキュリティ）、Phase 12.1-12.2（UX改善）
- **中**: Phase 12.3-12.4（機能追加、アクセシビリティ）、Phase 13.2（パフォーマンス）、Phase 15（CI/CD）
- **低**: Phase 14（モニタリング）、Phase 16（追加機能）、Phase 17（ドキュメント）

### 注意事項
- 各Phaseの完了時に動作確認を行う
- エラーが発生した場合は都度修正する
- コミットは機能単位で細かく行っても良い
- `.env.local` ファイルは絶対にコミットしない
- 本番環境の `ANTHROPIC_API_KEY` は安全に管理する

### タイムライン目安

**初期実装（Phase 1-10）✅ 完了**
- Phase 1-2: 30分〜1時間
- Phase 3: 1〜2時間
- Phase 4-5: 2〜3時間
- Phase 6: 1時間
- Phase 7-9: 1〜2時間
- Phase 10: 30分〜1時間
**小計**: 約6〜11時間（完了済み）

**品質向上・機能拡張（Phase 11-17）**
- Phase 11（テスト実装）: 4〜6時間
- Phase 12（UI/UX改善）: 3〜5時間
- Phase 13（セキュリティ・パフォーマンス）: 2〜4時間
- Phase 14（モニタリング）: 1〜2時間
- Phase 15（CI/CD）: 2〜3時間
- Phase 16（追加機能）: 3〜5時間（オプション）
- Phase 17（ドキュメント）: 2〜3時間（オプション）
**小計**: 約17〜28時間

**総合計**: 約23〜39時間（スキルレベル、実装範囲により変動）
