# GitHub Actions デプロイ設定ガイド

このドキュメントでは、GitHub Actionsを使用してGoogle Cloud Runへ自動デプロイする設定方法を説明します。

## 📋 前提条件

以下の設定はすでに完了しています：

✅ Google Cloud プロジェクト: `ai-chat-production-484909`
✅ サービスアカウント: `github-actions-deployer@ai-chat-production-484909.iam.gserviceaccount.com`
✅ Workload Identity Federation プール: `github-actions-pool`
✅ Workload Identity プロバイダー: `github-actions-provider`
✅ 必要な権限の付与
✅ GitHub リポジトリ: `zawakarui/ai-chat`

## 🔐 GitHub Secrets の設定

GitHub Actionsから環境変数にアクセスするため、リポジトリにSecretを追加する必要があります。

### 手順

1. **GitHubリポジトリにアクセス**
   https://github.com/zawakarui/ai-chat

2. **Settings > Secrets and variables > Actions** に移動

3. **「New repository secret」をクリック**

4. **Secretを追加**
   - **Name**: `ANTHROPIC_API_KEY`
   - **Secret**: `<your-anthropic-api-key>` (実際のAPIキーを入力してください)

5. **「Add secret」をクリック**して保存

## 🚀 デプロイの実行方法

### 自動デプロイ（推奨）

`main` ブランチにマージされると、自動的にデプロイが実行されます。

```bash
# 開発ブランチで作業
git checkout -b feat-new-feature
# ... コード変更 ...
git add .
git commit -m "Add new feature"
git push origin feat-new-feature

# GitHubでPRを作成してmainブランチにマージ
# → 自動的にCloud Runにデプロイされます
```

### デプロイの進行状況を確認

1. GitHubリポジトリの **Actions** タブにアクセス
2. 実行中のワークフローをクリック
3. 各ステップの進行状況とログを確認

## 📝 ワークフローの概要

`.github/workflows/deploy.yml` には以下のステップが定義されています：

1. **コードのチェックアウト**: リポジトリのコードを取得
2. **Google Cloud認証**: Workload Identity Federationで認証
3. **Cloud SDKセットアップ**: gcloudコマンドを使用可能に
4. **Dockerイメージビルド**: Cloud Buildでイメージを作成・プッシュ
5. **Cloud Runデプロイ**: 新しいイメージをデプロイ
6. **デプロイ結果表示**: サービスURLを表示

## 🔧 設定のカスタマイズ

### リソース設定の変更

`.github/workflows/deploy.yml` の以下の部分を編集：

```yaml
--memory 512Mi      # メモリ容量
--cpu 1             # CPU数
--max-instances 10  # 最大インスタンス数
--min-instances 0   # 最小インスタンス数
--timeout 60s       # タイムアウト時間
```

### 環境変数の追加

新しい環境変数を追加する場合：

1. GitHub Secretsに変数を追加
2. `deploy.yml` の `--set-env-vars` セクションに追加：

```yaml
--set-env-vars ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }},NEW_VAR=${{ secrets.NEW_VAR }}
```

## 🔍 トラブルシューティング

### デプロイが失敗する場合

1. **Actions タブでログを確認**
   エラーメッセージから原因を特定

2. **GitHub Secrets が設定されているか確認**
   Settings > Secrets and variables > Actions

3. **Google Cloud の権限を確認**
   ```bash
   gcloud projects get-iam-policy ai-chat-production-484909
   ```

4. **Workload Identity Federation の設定を確認**
   ```bash
   gcloud iam workload-identity-pools providers describe github-actions-provider \
     --location=global \
     --workload-identity-pool=github-actions-pool \
     --project=ai-chat-production-484909
   ```

### よくあるエラー

#### ❌ "Permission denied"
→ サービスアカウントの権限を確認してください

#### ❌ "Secret ANTHROPIC_API_KEY not found"
→ GitHub Secretsに `ANTHROPIC_API_KEY` が設定されているか確認

#### ❌ "Workload Identity Federation authentication failed"
→ Workload Identity Poolとプロバイダーの設定を確認

## 🌐 デプロイされたアプリケーション

デプロイ後のURL:
**https://ai-chat-132688141014.asia-northeast1.run.app**

## 📚 参考リンク

- [GitHub Actions ドキュメント](https://docs.github.com/en/actions)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run デプロイガイド](https://cloud.google.com/run/docs/deploying)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)
