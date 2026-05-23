# Protein Ledger / 增肌账本

一个面向个人增肌期的 MVP Web App：记录蛋白质摄入，同时做简单日常记账。项目使用 Next.js + TypeScript + Tailwind CSS + Supabase，移动端优先，并支持基础 PWA 添加到桌面。

## 功能

- 邮箱注册、登录、退出
- 登录状态持久化，刷新后数据不丢失
- 今日页包含“蛋白质”和“记账”两个 Tab
- 蛋白质快捷添加、手动添加、补录日期、删除记录、目标差值计算
- 记账收入/支出添加、分类、补录日期、删除记录、今日收支结余
- 统计页支持按日 / 按月查看蛋白质和记账数据
- Supabase PostgreSQL 持久化，RLS 隔离用户数据
- `manifest.json` 和 service worker 支持添加到桌面

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 创建 `.env.local`：

```bash
cp .env.local.example .env.local
```

3. 填写 Supabase 配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
```

4. 启动开发服务器：

```bash
npm run dev
```

打开 http://localhost:3000。

## 配置 Supabase

1. 在 Supabase 新建项目。
2. 进入 Project Settings -> API，复制 Project URL。
3. 复制可发布密钥，也就是 `anon` / `sb_publishable_...`，不要使用 `secret` 密钥。
4. 进入 SQL Editor，运行 `supabase/schema.sql` 里的完整 SQL。
5. 进入 Authentication -> Providers，确认 Email 登录启用。
6. 本地测试时，如果希望注册后马上登录，可以临时关闭邮箱确认。

## 部署到 Vercel

1. 将本项目推送到 GitHub。
2. 在 Vercel 导入该 GitHub 仓库。
3. 在 Vercel Project Settings -> Environment Variables 添加：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
```

4. 部署项目。
5. 回到 Supabase -> Authentication -> URL Configuration，配置：

```text
Site URL: https://your-vercel-domain.vercel.app
Redirect URLs:
https://your-vercel-domain.vercel.app/**
http://localhost:3000/**
```

## 项目结构

```text
app/                  Next.js App Router 页面
components/           页面组件和业务组件
lib/                  Supabase 客户端、类型、工具函数
public/manifest.json  PWA manifest
public/sw.js          基础 service worker
supabase/schema.sql   建表语句和 RLS policy
```

## 注意

`.env.local` 只放在本地或 Vercel 环境变量中，不要提交到 GitHub。
