# P3R 风格博客

一个基于 Persona 3 Reload 视觉风格的个人博客，采用 Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 构建，通过静态导出 (SSG) 部署到 GitHub Pages。

## ✨ 特性

- 🎨 **P3R UI 风格**
- ⚡ **SSG 静态导出** — 全站预渲染，零服务端依赖
- 📝 **Markdown 驱动** — 使用 gray-matter + Zod 解析和校验 frontmatter，支持代码高亮和 TOC
- 🗂️ **专题系列** — 支持按主题组织的系列文章
- 💬 **Giscus 评论** — 基于 GitHub Discussions 的评论系统
- 📱 **响应式设计** — 适配桌面端和移动端

## 快速开始

确保已安装 Node.js (≥18) 和 pnpm。

```bash
pnpm install
pnpm dev
```

## 质量检查与构建

```bash
pnpm check  # lint + typecheck + test + build
```

静态产物输出到 `out/` 目录，构建后同时生成 `feed.xml` 与 `sitemap.xml`。

## 部署

项目已配置 GitHub Actions，推送到 `main` 分支即可自动部署到 GitHub Pages。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router, SSG) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| 内容 | Markdown + gray-matter + Zod |
| 评论 | Giscus |
| 部署 | GitHub Pages + Actions |
