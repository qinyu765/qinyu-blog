# AGENTS.md

本文件为 AI 编码助手（Gemini / Claude / Antigravity 等）提供项目上下文指引。

---

## 项目概述

**Persona 3 Reload 风格个人博客**，以游戏 P3R 的视觉风格为核心设计语言，包含斜切变换、深蓝色调、科技感 UI 等标志性元素。

**技术栈：** React 19 + Vite 6 + TypeScript + Tailwind CSS 3（本地构建）

**包管理器：** pnpm（`preinstall` hook 强制使用）

**部署：** GitHub Pages，通过 GitHub Actions 自动部署（`.github/workflows/deploy.yml`），推送 `main` 分支即触发。

---

## 开发命令

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器（端口 3000）
pnpm build       # 生产构建 → dist/
pnpm preview     # 本地预览生产构建
```

> 未配置测试框架或 linter。

---

## 项目结构

```
/                         # 项目根目录（无 src/ 层级）
├── index.html            # HTML 入口（Google Fonts 加载）
├── index.tsx             # React 挂载点
├── index.css             # 全局基础样式
├── App.tsx               # 路由定义（HashRouter）
├── types.ts              # 全局类型定义
├── constants.ts          # 博客文章、专题、导航项导出
├── vite.config.ts        # Vite 配置（@/ 路径别名 → 根目录）
├── tailwind.config.js    # Tailwind 主题扩展（配色 / 字体 / 动画）
├── tsconfig.json         # TypeScript 配置
├── postcss.config.js     # PostCSS（Tailwind + Autoprefixer）
│
├── components/           # 可复用组件
│   ├── Layout.tsx        # 全局布局壳：固定顶栏、导航、面包屑、底部状态条
│   ├── ArticleView.tsx   # 文章阅读视图（含 TOC 侧边栏）
│   ├── MarkdownRenderer.tsx  # P3R 风格的 Markdown 渲染器
│   ├── P3RDialogUI.tsx   # P3R 对话框风格 UI 组件
│   ├── ScrollToTop.tsx   # 路由切换时自动滚动到顶部
│   └── ui/               # 原子级 UI 组件
│       ├── BackgroundEffect.tsx   # 固定背景（月亮 + 水波纹动画）
│       ├── HamburgerMenu.tsx      # 移动端汉堡菜单
│       ├── Logo.tsx               # 站点 Logo
│       ├── SkewButton.tsx         # 斜切风导航按钮
│       └── TableOfContents.tsx    # 圆柱滚动式目录（Slot Machine TOC）
│
├── pages/                # 页面组件（通过 <Outlet /> 渲染）
│   ├── Home.tsx          # 首页（技能卡片、收藏夹等区块）
│   ├── BlogList.tsx      # 博客列表页（含搜索、分类筛选）
│   ├── BlogPost.tsx      # 博客文章详情页
│   ├── TopicList.tsx     # 专题列表页
│   ├── TopicDetail.tsx   # 专题详情页
│   └── TopicPostPage.tsx # 专题文章页
│
├── lib/                  # 工具库
│   ├── blog-loader.ts    # 博客/专题内容加载器（import.meta.glob）
│   ├── reading-time.ts   # 阅读时间估算
│   └── toc.ts            # 目录标题提取
│
├── content/              # 文章内容（Markdown）
│   ├── posts/            # 独立博客文章（9 篇）
│   └── topics/           # 系列专题
│       └── react-deep-dive/  # 示例专题
│           ├── index.md      # 专题元信息
│           ├── 01-virtual-dom.md
│           └── 02-hooks-closures.md
│
├── public/               # 静态资源
│   ├── CNAME             # GitHub Pages 自定义域名
│   ├── logo.svg          # 站点 Logo SVG
│   └── images/           # 图片资源
│
├── .github/workflows/
│   └── deploy.yml        # GitHub Actions 部署配置
│
├── docs/
│   └── cellstack-analysis.md  # 设计分析文档
│
├── CLAUDE.md             # Claude Code 上下文文件
└── AGENTS.md             # 本文件（通用 AI 助手上下文）
```

---

## 路由系统

使用 `HashRouter`（兼容 GitHub Pages 静态部署），路由定义在 `App.tsx`：

| 路径 | 页面 |
|------|------|
| `/` | `Home` — 首页 |
| `/blog` | `BlogList` — 博客列表 |
| `/blog/:id` | `BlogPost` — 博客详情 |
| `/topics` | `TopicList` — 专题列表 |
| `/topics/:topicSlug` | `TopicDetail` — 专题详情 |
| `/topics/:topicSlug/:postSlug` | `TopicPostPage` — 专题文章 |
| `*` | 重定向至 `/` |

当前导航项（`constants.ts`）：HOME、BLOG、ABOUT（锚点）、FAVORITES（锚点）。TOPICS 暂时注释。

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

### Tailwind 配置

Tailwind CSS 3 通过 `tailwind.config.js` + PostCSS 本地构建，所有自定义主题（颜色 / 字体 / 动画 / 关键帧）定义在配置文件中。

---

## 模块解析

- **路径别名：** `@/` → 项目根目录（`vite.config.ts` 和 `tsconfig.json` 均配置）
- **构建：** Vite 6 + `@vitejs/plugin-react`

---

## 博客内容系统

### 独立文章

Markdown 文件存放于 `content/posts/`，构建时由 `lib/blog-loader.ts` 通过 `import.meta.glob` 加载。文件名即 URL slug（`my-post.md` → `/#/blog/my-post`）。

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

> 注意：使用简易正则解析器，不支持嵌套 YAML 值。

文章按日期降序排列，通过 `constants.ts` 中的 `BLOG_POSTS` 导出。

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
| `Layout` | `components/Layout.tsx` | 全局外壳：固定顶栏（Logo + 导航）、滚动隐藏行为、面包屑、底部状态条 |
| `ArticleView` | `components/ArticleView.tsx` | 文章阅读布局，左侧 TOC + 右侧内容 |
| `MarkdownRenderer` | `components/MarkdownRenderer.tsx` | P3R 主题 react-markdown 渲染，含代码高亮 |
| `BackgroundEffect` | `components/ui/BackgroundEffect.tsx` | 固定全屏背景：月亮动画 + 水波纹效果 |
| `TableOfContents` | `components/ui/TableOfContents.tsx` | 3D 圆柱滚动式目录（Slot Machine 效果） |
| `SkewButton` | `components/ui/SkewButton.tsx` | 斜切风导航按钮 |
| `HamburgerMenu` | `components/ui/HamburgerMenu.tsx` | 移动端响应式导航菜单 |

---

## 编码规范

- 源码位于项目根目录，无 `src/` 层级
- 使用 TypeScript 严格类型
- 组件使用函数式组件 + Hooks
- 新代码注释使用中文
- Commit message 使用中文描述
