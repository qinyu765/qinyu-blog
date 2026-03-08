# CLAUDE.md

本文件为 Claude Code 提供项目上下文。完整的项目架构文档请参阅 `AGENTS.md`。

## 快速参考

- **技术栈：** React 19 + Vite 6 + TypeScript + Tailwind CSS 3
- **包管理器：** pnpm（`preinstall` hook 强制）
- **开发服务器：** `pnpm dev`（端口 3000）
- **构建：** `pnpm build` → `dist/`
- **未配置**测试框架或 linter

## 关键约定

- 源码位于**项目根目录**（无 `src/` 层级）
- 使用 `HashRouter`，兼容 GitHub Pages 静态部署
- 路径别名 `@/` → 项目根目录
- 博客文章存放于 `content/posts/`，文件名即 URL slug
- 配色系统：`p3blue` / `p3cyan` / `p3dark` / `p3mid` / `p3white` / `p3red` / `p3black`
- 标志性视觉：容器 `-skew-x-12` + 文字 `skew-x-12` 反向抵消

## 详细文档

所有架构细节（路由、组件、样式体系、内容系统、类型定义等）请查看 [`AGENTS.md`](./AGENTS.md)。
