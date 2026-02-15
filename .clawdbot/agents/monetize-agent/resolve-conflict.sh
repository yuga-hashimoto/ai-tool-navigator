#!/bin/bash
# コンフリクト解消スクリプト - mainを優先
cd /Users/yu-ga/.openclaw/agents/monetize-agent

# 依存関係ファイルはmainを優先
git checkout --ours package.json package-lock.json prisma/schema.prisma

# DBファイルはPR側（新しいマイグレーションを保持）
git checkout --theirs prisma/dev.db

# すべてステージ
git add package.json package-lock.json prisma/schema.prisma prisma/dev.db

# リベース継続（エディタを無効化）
GIT_EDITOR=true git rebase --continue
