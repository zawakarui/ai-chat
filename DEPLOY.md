# デプロイガイド - Google Cloud Run

このドキュメントでは、AIチャットボットアプリケーションをGoogle Cloud Runにデプロイする手順を説明します。

## 前提条件

- [x] Dockerfileと.dockerignoreが作成済み
- [x] next.config.jsでstandaloneビルドが有効化済み
- [ ] Dockerがインストールされ、Docker Desktopが起動している
- [ ] Google Cloudアカウントを持っている
- [ ] 本番環境用のAnthropic API Keyを取得している

---

## Phase 8.1: Google Cloud の準備

### 1. Google Cloud プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
   - プロジェクト名: `ai-chat-production`（任意）
   - プロジェクトIDをメモしておく（例: `ai-chat-prod-123456`）
   ai-chat-production-484909
   
3. 課金を有効化する（Cloud Runは従量課金制）

### 2. gcloud CLI のインストール・認証

**macOS の場合:**
```bash
# gcloud CLIのインストール
brew install --cask google-cloud-sdk

# または公式インストーラーを使用
# https://cloud.google.com/sdk/docs/install
```

**認証:**
```bash
# Google アカウントで認証
gcloud auth login

# プロジェクトを設定
gcloud config set project [PROJECT-ID]

# 認証情報をDockerに設定
gcloud auth configure-docker
```

### 3. 必要なAPIの有効化

```bash
# Container Registry API の有効化
gcloud services enable containerregistry.googleapis.com

# Cloud Run API の有効化
gcloud services enable run.googleapis.com

# Cloud Build API の有効化（オプション、自動ビルドに使用）
gcloud services enable cloudbuild.googleapis.com
```

または、[Google Cloud Console](https://console.cloud.google.com/apis/library) から手動で有効化できます。

---

## Phase 8.2: Dockerイメージのビルド・プッシュ

### 1. ローカルでのDockerビルドテスト

まず、ローカル環境でDockerイメージが正しくビルドできることを確認します。

```bash
# Docker Desktopが起動していることを確認
docker --version

# プロジェクトルートディレクトリで実行
cd /Users/aokitakao/Documents/GitHub/ai-chat

# Dockerイメージをビルド
docker build -t ai-chat .

# ビルドが成功したら、ローカルでテスト実行
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY="your-api-key-here" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  ai-chat

# ブラウザで http://localhost:3000 にアクセスして動作確認
# 確認後、Ctrl+C で停止
```

### 2. Google Container Registry へのプッシュ

**プロジェクトIDを環境変数に設定:**
```bash
export PROJECT_ID=$(gcloud config get-value project)
echo "Project ID: $PROJECT_ID"
```

**イメージをビルドしてプッシュ:**
```bash
# Google Container Registry用にタグ付けしてビルド
docker build -t gcr.io/$PROJECT_ID/ai-chat:latest .

# Container Registryにプッシュ
docker push gcr.io/$PROJECT_ID/ai-chat:latest

# プッシュが成功したか確認
gcloud container images list
```

**または、Cloud Buildを使用する方法（推奨）:**
```bash
# Cloud Buildで直接ビルド・プッシュ
gcloud builds submit --tag gcr.io/$PROJECT_ID/ai-chat:latest .

# この方法の利点:
# - ローカルでビルドする必要がない
# - より高速（Google Cloud上でビルド）
# - アップロード時間が短縮される
```

---

## Phase 8.3: Cloud Run へのデプロイ

### 1. 初回デプロイ

```bash
# 環境変数を設定してデプロイ
gcloud run deploy ai-chat \
  --image gcr.io/$PROJECT_ID/ai-chat:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY="your-production-api-key-here" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 60s

# デプロイが完了すると、URLが表示されます:
# Service [ai-chat] revision [ai-chat-00001-xxx] has been deployed
# Service URL: https://ai-chat-xxxxxx-an.a.run.app
```

### 2. デプロイ後のURL確認

```bash
# デプロイされたサービスのURLを確認
gcloud run services describe ai-chat \
  --region asia-northeast1 \
  --format 'value(status.url)'
```

出力例: `https://ai-chat-xxxxxx-an.a.run.app`

### 3. NEXT_PUBLIC_APP_URL の更新と再デプロイ

デプロイ後に取得したURLを使って、環境変数を更新します。

```bash
# 取得したURLを変数に設定
export APP_URL="https://ai-chat-xxxxxx-an.a.run.app"

# 環境変数を更新して再デプロイ
gcloud run deploy ai-chat \
  --image gcr.io/$PROJECT_ID/ai-chat:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY="your-production-api-key-here",NEXT_PUBLIC_APP_URL="$APP_URL" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 60s
```

---

## Phase 8.4: 本番環境での動作確認

### 1. チャット機能の動作確認

1. デプロイされたURLにブラウザでアクセス
2. メッセージを送信して、AIからのレスポンスを確認
3. 複数の会話を行い、正常に動作することを確認

### 2. ストリーミングレスポンスの確認

1. メッセージを送信
2. AIの応答が1文字ずつストリーミング表示されることを確認
3. ブラウザの開発者ツールで、Server-Sent Eventsが正常に受信されているか確認

### 3. モバイルデバイスでの確認

1. スマートフォンでデプロイされたURLにアクセス
2. レスポンシブデザインが正しく表示されることを確認
3. タッチ操作でメッセージ送信が正常に動作することを確認

### 4. エラーログの確認

```bash
# Cloud Run のログを確認
gcloud run services logs read ai-chat \
  --region asia-northeast1 \
  --limit 50

# リアルタイムでログを監視
gcloud run services logs tail ai-chat \
  --region asia-northeast1
```

または、[Google Cloud Console > Cloud Run > ai-chat > ログ](https://console.cloud.google.com/run) から確認できます。

---

## トラブルシューティング

### Docker ビルドエラー

**エラー: `Cannot connect to the Docker daemon`**
```bash
# Docker Desktop が起動しているか確認
# macOS: Dock に Docker アイコンがあり、クジラが表示されている

# Docker Desktop を起動してから再試行
docker --version
```

**エラー: `npm ci` が失敗する**
```bash
# package-lock.json が最新か確認
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

### Cloud Run デプロイエラー

**エラー: `Permission denied`**
```bash
# 適切な権限があるか確認
gcloud projects get-iam-policy $PROJECT_ID

# Cloud Run Admin ロールを付与（必要に応じて）
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=user:your-email@example.com \
  --role=roles/run.admin
```

**エラー: `API not enabled`**
```bash
# 必要なAPIを再度有効化
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### アプリケーションエラー

**エラー: `ANTHROPIC_API_KEY is not set`**
```bash
# 環境変数が正しく設定されているか確認
gcloud run services describe ai-chat \
  --region asia-northeast1 \
  --format 'value(spec.template.spec.containers[0].env)'

# 環境変数を再設定
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --set-env-vars ANTHROPIC_API_KEY="your-api-key"
```

**エラー: `Memory limit exceeded`**
```bash
# メモリを増やして再デプロイ
gcloud run deploy ai-chat \
  --image gcr.io/$PROJECT_ID/ai-chat:latest \
  --region asia-northeast1 \
  --memory 1Gi
```

---

## 継続的デプロイ（オプション）

### GitHub Actions を使った自動デプロイ

`.github/workflows/deploy.yml` を作成して、mainブランチへのプッシュ時に自動デプロイを設定できます。

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: ai-chat
  REGION: asia-northeast1

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Build and push Docker image
        run: |
          gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy $SERVICE_NAME \
            --image gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated \
            --set-env-vars ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }}
```

**必要なGitHub Secrets:**
- `GCP_PROJECT_ID`: Google Cloud プロジェクトID
- `GCP_SA_KEY`: サービスアカウントの認証情報（JSON）
- `ANTHROPIC_API_KEY`: 本番環境のAnthropic API Key

---

## コスト管理

### Cloud Run の料金

Cloud Runは従量課金制です。無料枠があります：

- **リクエスト**: 200万リクエスト/月（無料）
- **CPU時間**: 180,000 vCPU秒/月（無料）
- **メモリ**: 360,000 GiB秒/月（無料）
- **ネットワーク（送信）**: 1GB/月（無料）

**コスト削減のヒント:**
```bash
# 最小インスタンス数を0に設定（リクエストがない時は課金されない）
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --min-instances 0

# 最大インスタンス数を制限
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --max-instances 5

# タイムアウトを短く設定
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --timeout 30s
```

### モニタリング

```bash
# 使用状況を確認
gcloud run services describe ai-chat \
  --region asia-northeast1 \
  --format 'value(status.traffic)'

# 課金情報を確認
# https://console.cloud.google.com/billing
```

---

## まとめ

このガイドに従えば、AIチャットボットアプリケーションをGoogle Cloud Runにデプロイできます。

**チェックリスト:**
- [x] Dockerfileとデプロイ設定が完了
- [ ] Docker Desktopを起動
- [ ] Google Cloudプロジェクトを作成
- [ ] gcloud CLIをインストール・認証
- [ ] 必要なAPIを有効化
- [ ] ローカルでDockerビルドをテスト
- [ ] Container Registryにイメージをプッシュ
- [ ] Cloud Runにデプロイ
- [ ] 本番環境で動作確認
- [ ] エラーログを確認

**次のステップ:**
- カスタムドメインの設定
- HTTPS証明書の設定（Cloud Runは自動）
- CI/CD パイプラインの構築
- モニタリングとアラートの設定

---

## 参考リンク

- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [Container Registry ドキュメント](https://cloud.google.com/container-registry/docs)
- [gcloud CLI リファレンス](https://cloud.google.com/sdk/gcloud/reference)
- [Next.js Dockerデプロイ](https://nextjs.org/docs/deployment#docker-image)
