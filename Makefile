# AI Chat - Makefile
# プロジェクトの主要なコマンドをまとめたMakefile

.PHONY: help install dev build start clean docker-build docker-run deploy-build deploy-run deploy format

# デフォルトターゲット: ヘルプを表示
help:
	@echo "AI Chat - 利用可能なコマンド:"
	@echo ""
	@echo "初期セットアップ:"
	@echo "  make install        - 依存関係をインストール"
	@echo "  make setup          - プロジェクトの初期セットアップ（install + .env.local作成）"
	@echo ""
	@echo "開発:"
	@echo "  make dev            - 開発サーバーを起動 (http://localhost:3000)"
	@echo "  make build          - プロダクションビルドを実行"
	@echo "  make start          - プロダクションサーバーを起動"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build   - Dockerイメージをビルド"
	@echo "  make docker-run     - Dockerコンテナをローカルで起動"
	@echo "  make docker-test    - Dockerビルド→実行の一連テスト"
	@echo ""
	@echo "Google Cloud Run デプロイ:"
	@echo "  make deploy-build   - Cloud Buildでイメージをビルド・プッシュ"
	@echo "  make deploy-run     - Cloud Runにデプロイ"
	@echo "  make deploy         - ビルド→デプロイの一連実行"
	@echo ""
	@echo "その他:"
	@echo "  make format         - コードをフォーマット (Prettier)"
	@echo "  make clean          - ビルド成果物を削除"
	@echo "  make logs           - Cloud Runのログを表示"

# ========================================
# 初期セットアップ
# ========================================

# 依存関係のインストール
install:
	@echo "📦 依存関係をインストール中..."
	npm install

# プロジェクトの初期セットアップ
setup: install
	@echo "⚙️  プロジェクトをセットアップ中..."
	@if [ ! -f .env.local ]; then \
		echo "📝 .env.local を作成中..."; \
		cp .env.example .env.local; \
		echo ""; \
		echo "⚠️  重要: .env.local を編集して、ANTHROPIC_API_KEY を設定してください"; \
		echo "   API Keyは https://console.anthropic.com/ から取得できます"; \
	else \
		echo "✓ .env.local は既に存在します"; \
	fi

# ========================================
# 開発
# ========================================

# 開発サーバーを起動
dev:
	@echo "🚀 開発サーバーを起動中..."
	npm run dev

# プロダクションビルド
build:
	@echo "🔨 プロダクションビルドを実行中..."
	npm run build

# プロダクションサーバーを起動
start:
	@echo "▶️  プロダクションサーバーを起動中..."
	npm start

# ========================================
# Docker
# ========================================

# Dockerイメージをビルド
docker-build:
	@echo "🐳 Dockerイメージをビルド中..."
	docker build -t ai-chat .

# Dockerコンテナをローカルで起動
docker-run:
	@echo "🐳 Dockerコンテナを起動中..."
	@if [ ! -f .env.local ]; then \
		echo "❌ エラー: .env.local が見つかりません"; \
		echo "   make setup を実行して .env.local を作成してください"; \
		exit 1; \
	fi
	docker run -p 3000:3000 --env-file .env.local ai-chat

# Dockerビルド→実行の一連テスト
docker-test: docker-build
	@echo "🧪 Dockerコンテナをテスト実行中..."
	@echo "   ブラウザで http://localhost:3000 にアクセスしてください"
	@echo "   停止するには Ctrl+C を押してください"
	@if [ ! -f .env.local ]; then \
		echo "❌ エラー: .env.local が見つかりません"; \
		exit 1; \
	fi
	docker run -p 3000:3000 --env-file .env.local ai-chat

# ========================================
# Google Cloud Run デプロイ
# ========================================

# プロジェクトID取得（環境変数または gcloud から）
PROJECT_ID ?= $(shell gcloud config get-value project 2>/dev/null)
REGION ?= asia-northeast1
SERVICE_NAME ?= ai-chat

# Cloud Buildでイメージをビルド・プッシュ
deploy-build:
	@echo "☁️  Cloud Buildでイメージをビルド中..."
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "❌ エラー: PROJECT_ID が設定されていません"; \
		echo "   以下のいずれかの方法で設定してください:"; \
		echo "   1. gcloud config set project YOUR_PROJECT_ID"; \
		echo "   2. make deploy-build PROJECT_ID=YOUR_PROJECT_ID"; \
		exit 1; \
	fi
	gcloud builds submit --tag gcr.io/$(PROJECT_ID)/$(SERVICE_NAME):latest .

# Cloud Runにデプロイ
deploy-run:
	@echo "🚀 Cloud Runにデプロイ中..."
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "❌ エラー: PROJECT_ID が設定されていません"; \
		exit 1; \
	fi
	@if [ -z "$(ANTHROPIC_API_KEY)" ]; then \
		echo "❌ エラー: ANTHROPIC_API_KEY が設定されていません"; \
		echo "   以下のように実行してください:"; \
		echo "   make deploy-run ANTHROPIC_API_KEY=your-api-key"; \
		exit 1; \
	fi
	gcloud run deploy $(SERVICE_NAME) \
		--image gcr.io/$(PROJECT_ID)/$(SERVICE_NAME):latest \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--memory 512Mi \
		--cpu 1 \
		--max-instances 10 \
		--min-instances 0 \
		--timeout 60s \
		--set-env-vars ANTHROPIC_API_KEY=$(ANTHROPIC_API_KEY)

# ビルド→デプロイの一連実行
deploy: deploy-build
	@echo ""
	@echo "📋 次のステップ:"
	@echo "   以下のコマンドでデプロイを完了してください:"
	@echo "   make deploy-run ANTHROPIC_API_KEY=your-production-api-key"

# Cloud Runのログを表示
logs:
	@echo "📜 Cloud Runのログを表示中..."
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "❌ エラー: PROJECT_ID が設定されていません"; \
		exit 1; \
	fi
	gcloud run services logs read $(SERVICE_NAME) \
		--region $(REGION) \
		--limit 50

# Cloud Runのログをリアルタイム監視
logs-tail:
	@echo "📜 Cloud Runのログをリアルタイム監視中..."
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "❌ エラー: PROJECT_ID が設定されていません"; \
		exit 1; \
	fi
	gcloud run services logs tail $(SERVICE_NAME) \
		--region $(REGION)

# ========================================
# その他
# ========================================

# コードフォーマット
format:
	@echo "✨ コードをフォーマット中..."
	npx prettier --write .

# ビルド成果物を削除
clean:
	@echo "🧹 ビルド成果物を削除中..."
	rm -rf .next
	rm -rf out
	rm -rf build
	rm -rf node_modules/.cache
	@echo "✓ クリーンアップ完了"

# Node.js のバージョン確認
check-node:
	@echo "📋 Node.js バージョン:"
	@node --version
	@echo ""
	@echo "📋 npm バージョン:"
	@npm --version

# プロジェクト情報を表示
info:
	@echo "📊 プロジェクト情報:"
	@echo ""
	@echo "プロジェクト名: AI Chat"
	@echo "説明: AIキャラクターとの楽しい会話を体験できるチャットアプリケーション"
	@echo ""
	@if [ -n "$(PROJECT_ID)" ]; then \
		echo "Google Cloud Project ID: $(PROJECT_ID)"; \
	else \
		echo "Google Cloud Project ID: 未設定"; \
	fi
	@echo "リージョン: $(REGION)"
	@echo "サービス名: $(SERVICE_NAME)"
