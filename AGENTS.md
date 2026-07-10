# AGENTS.md

本文件为 AI 编码助手（Gemini / Claude / Antigravity 等）提供项目上下文指引，是本项目 AI 上下文的**唯一事实源**。`CLAUDE.md` 为指向本文件的软连接，请勿单独维护第二份。

---

## 项目概述

**Persona 3 Reload 风格个人博客**，以游戏 P3R 的视觉风格为核心设计语言，包含斜切变换、深蓝色调、科技感 UI 等标志性元素。

**技术栈：** Next.js 15 (App Router, SSG) + React 19 + TypeScript + Tailwind CSS 4

**包管理器：** pnpm（`preinstall` hook 强制使用）

**部署：** GitHub Pages，通过 GitHub Actions 自动部署（`.github/workflows/deploy.yml`），推送 `main` 分支即触发。

---

## 开发命令

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器（端口 3000）
pnpm build       # 生产构建 → out/（SSG 静态导出）
pnpm start       # 本地预览生产构建

# 图片优化：将 public/images/ 下的 JPG 转为 WebP（需先 pnpm install）
node scripts/optimize-images.mjs
```

> 未配置测试框架或 linter。
>
> **注意：** 用户终端通常已在 `http://localhost:3000/` 常驻运行 `pnpm dev`，**不要**自行启动新的 dev server。

---

## 项目结构

```
/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # 根布局（Google Fonts、metadata）
│   │   ├── template.tsx      # 客户端布局包装器（LayoutShell）
│   │   ├── page.tsx          # 首页 Server Component
│   │   ├── HomeClient.tsx    # 首页 Client Component
│   │   ├── globals.css       # 全局样式（TW4 @import + @theme）
│   │   ├── not-found.tsx     # 404 页面
│   │   ├── blog/
│   │   │   ├── page.tsx      # 博客列表 SC
│   │   │   ├── BlogListClient.tsx  # 博客列表 CC
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # 文章详情 SC + generateStaticParams
│   │   │       └── BlogPostClient.tsx
│   │   └── topics/
│   │       ├── page.tsx
│   │       ├── TopicListClient.tsx
│   │       └── [topicSlug]/
│   │           ├── page.tsx
│   │           ├── TopicDetailClient.tsx
│   │           └── [postSlug]/
│   │               ├── page.tsx
│   │               └── TopicPostClient.tsx
│   │
│   ├── components/           # 可复用组件
│   │   ├── LayoutShell.tsx   # 全局布局壳（导航、背景）
│   │   ├── ArticleView.tsx   # 文章阅读视图（含 TOC 侧边栏）
│   │   ├── MarkdownRenderer.tsx  # P3R 风格 Markdown 渲染器
│   │   ├── P3RDialogUI.tsx   # P3R 对话框风格 UI 组件
│   │   ├── home/             # 首页子组件
│   │   │   ├── HeroSection.tsx
│   │   │   ├── RecentLogs.tsx
│   │   │   ├── MarqueePostCard.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   └── FavoritesSection.tsx
│   │   └── ui/               # 原子级 UI 组件
│   │       ├── BackgroundEffect.tsx
│   │       ├── HamburgerMenu.tsx
│   │       ├── Logo.tsx
│   │       ├── SkewButton.tsx
│   │       └── TableOfContents.tsx
│   │
│   ├── lib/                  # 工具库
│   │   ├── blog-loader.ts    # 博客/专题内容加载器（Node.js fs + gray-matter）
│   │   ├── favorites.ts      # Favorites 图片扫描（Node.js fs，Server-only）
│   │   ├── reading-time.ts
│   │   ├── skills.ts
│   │   └── toc.ts
│   │
│   └── types.ts              # 全局类型定义
│
├── content/              # 文章内容（Markdown）
│   ├── posts/            # 独立博客文章
│   └── topics/           # 系列专题
│
├── public/               # 静态资源
├── next.config.ts        # Next.js 配置（SSG export + unoptimized images）
├── postcss.config.mjs    # PostCSS（@tailwindcss/postcss）
├── tsconfig.json         # TypeScript（@/ → src/）
├── .github/workflows/deploy.yml
└── AGENTS.md
```

---

## 路由系统

使用 Next.js App Router（文件系统路由），SSG 静态导出：

| 路径 | 页面 |
|------|------|
| `/` | 首页（Server Component + HomeClient） |
| `/blog` | 博客列表 |
| `/blog/[id]` | 博客详情（generateStaticParams） |
| `/topics` | 专题列表 |
| `/topics/[topicSlug]` | 专题详情 |
| `/topics/[topicSlug]/[postSlug]` | 专题文章 |

导航项定义在 `LayoutShell.tsx`：HOME、BLOG、ABOUT（锚点）、FAVORITES（锚点）。

---

## 样式体系

### 配色 Tokens

| Token | 色值 | 用途 |
|-------|------|------|
| `p3blue` | `#1269CC` | 主色 |
| `p3cyan` | `#0FB1F5` | 强调色 |
| `p3dark` | `#0D1B2A` | 背景色 |
| `p3mid` | `#6D9AC7` | 弱化文字 |
| `p3white` | `#F0F0F0` | 正文色 |
| `p3red` | `#F40220` | 警告/高亮色 |
| `p3black` | `#070100` | 最深色 |

### 字体

- **展示用（标题）：** `font-display` → Anton + Noto Sans SC
- **正文：** `font-body` → Roboto Condensed + Noto Sans SC

### 视觉标识

- **斜切变换：** 容器用 `-skew-x-12`，内部文字用 `skew-x-12` 反向抵消
- **自定义动画：** `float`（上下浮动）、`pulse-fast`、`slide-in-right`、`marquee` / `marquee-reverse`

Tailwind CSS 4 通过 `postcss.config.mjs` + `@tailwindcss/postcss` 构建。所有自定义主题定义在 `globals.css` 的 `@theme` 块中。

---

## 模块解析

- **路径别名：** `@/` → `src/`（`tsconfig.json` 配置）
- **构建：** Next.js 15，`output: 'export'` 静态导出
- **数据加载：** Server Component 中使用 Node.js `fs` + `gray-matter` 读取 Markdown

---

## 博客内容系统

### 独立文章

Markdown 文件存放于 `content/posts/`，构建时由 `src/lib/blog-loader.ts` 通过 Node.js `fs` + `gray-matter` 加载。文件名即 URL slug（`my-post.md` → `/blog/my-post`）。

**必需 frontmatter：**

```yaml
---
title: "文章标题"
date: "2024.12.29"
category: "TECH"          # TECH | LIFE | MEMO
excerpt: "摘要文字"
coverImage: "https://..."  # 可选
tags: ["tag1", "tag2"]     # 可选
---
```

文章按日期降序排列，通过 `loadBlogPosts()` 函数导出。

### 系列专题

专题存放于 `content/topics/{topicSlug}/`，包含：
- `index.md` — 专题元信息（slug / title / description）及可选介绍内容
- `01-xxx.md`、`02-xxx.md` — 按序号排列的系列文章

---

## 类型定义（`types.ts`）

| 类型 | 说明 |
|------|------|
| `PostFrontmatter` | 文章 frontmatter 元数据 |
| `BlogPost` | 完整博客文章（含内容） |
| `TopicMeta` | 专题元信息 |
| `TopicPost` | 专题下的文章（继承 BlogPost） |
| `Topic` | 完整专题（meta + posts + introContent） |
| `NavItem` | 导航项（label + path + icon） |

---

## 关键组件说明

| 组件 | 文件 | 职责 |
|------|------|------|
| `LayoutShell` | `src/components/LayoutShell.tsx` | 全局外壳：固定顶栏（Logo + 导航）、滚动隐藏、Suspense 包装 |
| `ArticleView` | `src/components/ArticleView.tsx` | 文章阅读布局，左侧 TOC + 右侧内容 |
| `MarkdownRenderer` | `src/components/MarkdownRenderer.tsx` | P3R 主题 react-markdown 渲染，含代码高亮 |
| `BackgroundEffect` | `src/components/ui/BackgroundEffect.tsx` | 固定全屏背景：月亮动画 + 水波纹效果 |
| `TableOfContents` | `src/components/ui/TableOfContents.tsx` | 3D 圆柱滚动式目录（Slot Machine 效果） |
| `SkewButton` | `src/components/ui/SkewButton.tsx` | 斜切风导航按钮 |
| `HamburgerMenu` | `src/components/ui/HamburgerMenu.tsx` | 移动端响应式导航菜单 |

---

## 编码规范

- 源码使用 `src/` 目录结构
- 使用 TypeScript 严格类型
- 组件使用函数式组件 + Hooks
- Server Component 和 Client Component 分离（`'use client'` 指令）
- 新代码注释使用中文
- Commit message 使用中文描述

---

## AI Skills（Agent 技能）

本项目通过 [`vercel-labs/skills`](https://github.com/vercel-labs/skills) 生态管理可复用的 Agent 技能，安装记录锁定在根目录 `skills-lock.json`（已纳入版本控制），技能文件安装在 `.agents/skills/`（对应 `.claude/skills/`，二者为同一目录，均在 `.gitignore` 中）。

### 已装技能（贴合本项目技术栈）

| 技能 | 来源 | 用途 |
|------|------|------|
| `react-best-practices` | `vercel-labs/agent-skills` | Vercel 工程团队的 React + Next.js 性能优化准则（40+ 规则，按影响力分级）：消除请求瀑布、Bundle 瘦身、Server/Client 组件划分、重渲染优化等。 |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Web 视觉与交互设计规范。契合本站 P3R 视觉风格的组件设计与打磨。 |

> 说明：旧的 `next-best-practices`（`vercel-labs/next-skills`）已被上游废弃，故不再使用；Next.js 官方 `next-cache-components-*` 面向 server 运行时，与本项目「纯静态导出（`output: 'export'`）」不匹配，未安装。

### 恢复 / 更新技能

```bash
# 首次克隆后，按 skills-lock.json 还原全部技能（等价于 npm ci）
npx skills experimental_install

# 新增技能（会自动写入 skills-lock.json）
npx skills add vercel-labs/agent-skills -s react-best-practices

# 检查 / 更新
npx skills check
npx skills update
```
