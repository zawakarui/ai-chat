# AI Chat - エンターテイメントチャットボット

AIキャラクターとの楽しい会話を体験できるチャットアプリケーション

## 機能

- 🤖 **AIキャラクター対話**: Claude Sonnet 4.5を使用したインテリジェントな会話
- ⚡ **リアルタイムストリーミング**: 文字が1文字ずつ表示されるストリーミングレスポンス
- 💾 **セッション管理**: ブラウザセッション中は会話履歴を保持
- 📱 **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- 🎨 **ミニマルUI**: シンプルで洗練されたユーザーインターフェース

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Next.js API Routes + Hono
- **AI**: Anthropic Claude API + Mastra Agent Framework
- **状態管理**: React Hooks + sessionStorage
- **スタイリング**: CSS Modules + グローバルCSS変数

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Anthropic API Key

### インストール

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd ai-chat
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   # または
   make install
   ```

3. **環境変数の設定**

   `.env.local` ファイルを作成し、以下を設定:
   ```bash
   ANTHROPIC_API_KEY=your-api-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   Anthropic API Keyは[こちら](https://console.anthropic.com/)から取得できます。

**または、一括セットアップ:**
```bash
make setup  # install + .env.localのテンプレート作成
```

### 開発サーバーの起動

```bash
npm run dev
# または
make dev
```

ブラウザで http://localhost:3000 を開いてアプリケーションにアクセスします。

### ビルド

```bash
npm run build
npm start
# または
make build   # プロダクションビルド
make start   # プロダクションサーバー起動
```

## プロジェクト構造

```
ai-chat/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── chat/             # チャットストリーミングAPI
│   │   └── health/           # ヘルスチェックAPI
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # メインページ
│   └── globals.css           # グローバルスタイル
├── components/               # Reactコンポーネント
│   ├── Chat/                 # チャットコンテナ
│   ├── Message/              # メッセージバブル
│   └── Input/                # メッセージ入力
├── lib/                      # ユーティリティライブラリ
│   ├── chat-api.ts           # SSEストリーミング処理
│   ├── claude.ts             # Claude API クライアント
│   ├── mastra.ts             # Mastraエージェント設定
│   └── session.ts            # セッションストレージ管理
├── types/                    # TypeScript型定義
│   └── chat.ts               # チャット関連の型
└── CLAUDE.md                 # プロジェクト仕様書
```

## 使い方

1. **チャット開始**: アプリケーションを開くと、すぐにAIキャラクターとチャットできます
2. **メッセージ送信**: 下部の入力フォームにメッセージを入力してEnterキーまたは送信ボタンをクリック
3. **改行**: Shift+Enterで改行できます
4. **会話履歴**: ブラウザをリロードしても会話履歴は保持されます（タブを閉じるまで）

## 開発

### Makefileコマンド

よく使うコマンドはMakefileにまとめられています：

```bash
make help          # 利用可能なコマンド一覧を表示
make setup         # プロジェクト初期セットアップ
make dev           # 開発サーバー起動
make build         # プロダクションビルド
make docker-test   # Dockerで動作テスト
make deploy        # Cloud Runにデプロイ
make format        # コードフォーマット
make clean         # ビルド成果物削除
```

### コードの品質確認

```bash
# TypeScriptの型チェック
npm run build
# または
make build

# コードフォーマット（推奨: Prettierを使用）
npx prettier --write .
# または
make format
```

### デバッグ

ブラウザの開発者ツールを使用してコンソールログとネットワークリクエストを確認できます。

## デプロイ

### Google Cloud Run へのデプロイ

詳細は `DEPLOY.md` を参照してください。

**Makefileを使った簡単デプロイ:**
```bash
# 1. Cloud Buildでビルド・プッシュ
make deploy-build

# 2. Cloud Runにデプロイ
make deploy-run ANTHROPIC_API_KEY=your-production-api-key

# または一括実行
make deploy  # ビルド→デプロイ手順を表示
```

**手動デプロイ手順:**
1. Dockerイメージをビルド: `make docker-build`
2. Google Container Registryにプッシュ: `make deploy-build`
3. Cloud Runにデプロイ: `make deploy-run ANTHROPIC_API_KEY=xxx`
4. ログ確認: `make logs`

## トラブルシューティング

### API Key エラー
- `.env.local` に `ANTHROPIC_API_KEY` が正しく設定されているか確認
- API Keyが有効か確認

### ストリーミングが動作しない
- ブラウザのコンソールでエラーを確認
- ネットワークタブでServer-Sent Eventsが正しく受信されているか確認

### セッションストレージが機能しない
- ブラウザのプライベートモードではsessionStorageが制限される場合があります
- ブラウザの設定でストレージが有効になっているか確認

## プロジェクトステータス

**現在のバージョン**: v0.1.0
**実装ステータス**: MVP完成（Phase 1-10 完了）

### 完成済み機能 ✅
- 基本的なチャット機能
- Claude APIストリーミング対応
- セッションストレージによる履歴管理
- レスポンシブデザイン
- Docker対応
- デプロイ準備完了

### 今後の改善予定 📋
詳細は [IMPLEMENTATION_GAP_ANALYSIS.md](./IMPLEMENTATION_GAP_ANALYSIS.md) を参照してください。

**優先度: 高**
- [ ] テスト実装（ユニットテスト、E2Eテスト）
- [ ] セキュリティ強化（API Keyバリデーション、レート制限）
- [ ] エラー表示改善（ユーザーフレンドリーなメッセージ）
- [ ] ローディングインジケーター追加

**優先度: 中**
- [ ] パフォーマンス最適化（メッセージ数制限、バンドルサイズ削減）
- [ ] アクセシビリティ向上（ARIA属性、スクリーンリーダー対応）
- [ ] CI/CDパイプライン構築
- [ ] 機能追加（会話リセット、ダークモード等）

**優先度: 低**
- [ ] モニタリング・ロギング（Sentry, Cloud Monitoring）
- [ ] 追加機能（エクスポート、編集機能等）
- [ ] ドキュメント完成（API仕様書、アーキテクチャ図）

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 参考ドキュメント

- [TODO.md](./TODO.md) - 実装計画とタスク一覧
- [CLAUDE.md](./CLAUDE.md) - プロジェクト仕様書
- [DEPLOY.md](./DEPLOY.md) - デプロイガイド
- [IMPLEMENTATION_GAP_ANALYSIS.md](./IMPLEMENTATION_GAP_ANALYSIS.md) - 実装ギャップ分析

## 参考リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Mastra Framework](https://mastra.ai/docs)
