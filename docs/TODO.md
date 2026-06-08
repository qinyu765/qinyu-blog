# 项目优化 TODO

> 此文件记录待处理的项目优化项，按优先级排列。

---

## 最新分析（2026-06-08）

> 本节为最近一次代码巡检得出的"急需优化"短清单，按收益/风险比排序。
> 详细 backlog 仍维护在下方 P1~P4 章节，本节仅做指引与新增项登记。

### 高优先级（建议优先处理）

1. **`blog-loader.ts` 重复扫盘 + 重复解析** 🆕
   - `loadBlogPosts()` / `loadTopics()` 无任何缓存。文章详情路由的 `generateStaticParams`、`generateMetadata`、默认 `Page` 三个函数各调用一次，topics 三级路由同理。SSG 构建时，每篇文章都会触发数十次全量目录扫描与 `gray-matter` 解析。
   - **改法**：在 `src/lib/blog-loader.ts` 加模块级 `let cache: BlogPost[] | null`，首次加载后复用；dev 模式可按文件 mtime 失效。
   - 风险低、改动局限于单文件，构建时长立竿见影下降。

2. **`react-syntax-highlighter` 把整个 PrismJS 打入 bundle** ↘ 见 P3
   - `MarkdownRenderer.tsx` 从 `dist/cjs/styles/prism` 引入 `vscDarkPlus` + Prism 主体，导致**所有语言定义**进入首屏 JS。
   - **改法**（任选其一）：
     - `PrismAsyncLight` + 仅 `registerLanguage` 实际用到的（ts/js/bash/md/css 等）；
     - 用 `next/dynamic` 把代码块组件懒加载；
     - 切换 `shiki` 在构建期把高亮做成静态 HTML，运行时 0 JS（推荐）。

3. **Google Fonts 外链阻塞首屏** 🆕
   - `src/app/layout.tsx:36` 直接 `<link>` 到 `fonts.googleapis.com`，未子集化、未指定 `font-display`、依赖国外 CDN。
   - **改法**：改用 `next/font/google` 的 `Anton` / `Noto_Sans_SC` / `Roboto_Condensed`，自动自托管 + 子集化 + 零 CLS。

### 中优先级

4. **`ArticleView` 滚动监听强制 layout** ↘ 见 P3
   - `src/components/ArticleView.tsx:37-51` 每次 rAF 都对全部 heading 调 `getBoundingClientRect`。长文章可感卡顿。
   - **改法**：改 `IntersectionObserver`，注册一次即可。

5. **`LayoutShell` 整体被 `'use client'` 污染** 🆕
   - 顶栏 breadcrumb、导航壳全部位于客户端组件内。breadcrumb 渲染可在 server 端完成。
   - **改法**：把交互部分（汉堡菜单、search 高亮）抽成小的 client 子组件，让 `LayoutShell` 本身回到 server。

6. **`HomeClient` hash 锚点用 `setTimeout` 自旋轮询** 🆕
   - `src/app/HomeClient.tsx:23-37` 每 50ms 重试找元素，写法脏且不可靠。
   - **改法**：`useLayoutEffect` + `scrollIntoView`，或交由浏览器原生 hash 滚动处理。

### 低优先级（可顺手）

- `BackgroundEffect` 7 条 ripple + caustics + noise 持续动画，移动端 CPU 偏高；建议移动端裁剪 ripple 数量，或加 `content-visibility: auto`。
- `FavoritesSection` / `AboutSection` 各自实现 IntersectionObserver，抽出公共 `useInView` hook。
- `<img>` 多处缺 `width / height`（logo、`user_admin.webp`、favorites 图）会有 CLS。
- 尚未引入 ESLint / prettier / 测试，`package.json` 的 `lint` 脚本仅是 `next lint` 占位。↘ 见 P2

---

## P1 — 代码质量

- [x] **拆分 `Home.tsx`（480+ 行巨型组件）**
  - 拆为 `HeroSection`、`RecentLogs`、`AboutSection`、`FavoritesSection`
  - 技能数据（skills 数组）抽取到 `constants.ts`
  - Favorites 图片解析逻辑抽取到 `lib/` 工具函数

- [x] **提取跑马灯卡片组件**
  - Row1 / Row2 卡片结构几乎完全相同
  - 提取为 `MarqueePostCard` 组件

- [x] **删除注释掉的 Dead Code** ✅
  - 原 `Home.tsx` 已完全重构拆分为 `HomeClient.tsx` + `components/home/`，旧注释代码已清除
  - `LayoutShell.tsx`（原 `Layout.tsx`）中无注释代码残留

- [x] **统一 SVG 背景纹理**
  - `HeroSection.tsx`、`ArticleView.tsx`、`TopicDetailClient.tsx`、`TopicListClient.tsx` 中重复的 Base64 SVG
  - 定义为全局 Tailwind utility class（如 `bg-p3r-crosshatch`）

- [x] **完善 Markdown 渲染类型与复用**
  - `MarkdownRenderer.tsx` 的 `code` 渲染使用 `any`，补齐 `react-markdown` components 的类型约束
  - 抽出重复的排版样式（标题/列表/引用块等）为小组件或常量，降低维护成本

- [x] **Frontmatter 解析升级**
  - 已从简易正则解析器迁移至 `gray-matter`，支持完整 YAML frontmatter
  - 待办：schema 校验（zod）和 `draft: true` 过滤

- [ ] **`blog-loader` 增加模块级缓存** 🆕 2026-06-08
  - 当前 `loadBlogPosts()` / `loadTopics()` 每次都重读磁盘 + 解析。详情路由的三个函数（`generateStaticParams` / `generateMetadata` / `Page`）会重复调用，构建期成本被放大。
  - 建议加模块级 `cache` 变量，首次加载后复用；dev 模式可用 mtime 失效。
  - 涉及文件：`src/lib/blog-loader.ts`

- [x] **同步项目文档与实际实现** — 已在 Next.js 迁移后更新 `AGENTS.md`

---

## P1.5 — SEO 补全（🔴 高优先）

> 参考 [cellstack-analysis.md](./cellstack-analysis.md) §4.1 和 [Conversation Analysis.md](./Conversation%20Analysis.md) §P1

- [x] **JSON-LD 结构化数据** ✅
  - 添加 `src/lib/structured-data.ts`，输出 WebSite / Person / BreadcrumbList / ArticleJsonLd
  - 已注入到 `layout.tsx`（全局）和 `blog/[id]/page.tsx`（文章页）

- [x] **`app/robots.ts` — 动态生成 robots.txt** ✅
  - 使用 Next.js App Router 的 `MetadataRoute.Robots` API

- [x] **`app/sitemap.ts` — 动态生成 sitemap.xml** ✅
  - 遍历所有 posts + topics 路由，替代旧的 `scripts/generate-sitemap.mjs`

- [x] **RSS / Atom Feed 生成** ✅
  - `scripts/build-feed.mjs` 构建时生成 `out/feed.xml`（RSS 2.0）
  - `package.json` postbuild 脚本自动触发

---

## P2 — 工程化

- [ ] **添加 ESLint + Prettier**
  - 推荐 `@eslint/js` + `typescript-eslint`
  - 可选 Husky + lint-staged pre-commit

- [ ] **统一换行符为 LF**
  - 部分文件 CRLF（`LayoutShell.tsx` 等）
  - 添加 `.editorconfig`

- [x] **改善 SEO 标签** — 已迁移至 Next.js `metadata` API（每页静态 + 动态 generateMetadata）

- [ ] **检查 `tsconfig.json` 严格模式**
  - 确保 `strict: true`、`noUncheckedIndexedAccess`

- [ ] **补充 `typecheck` 脚本并接入 CI**
  - `package.json` 添加 `typecheck: tsc --noEmit`
  - GitHub Actions 对 PR / main 做 `pnpm typecheck` + `pnpm build`

- [x] ~~扩展 sitemap / feed 生成~~ — 已拆分至 P1.5 SEO 补全章节

- [ ] **增加 bundle 体积可视化（可选）**
  - 使用 `rollup-plugin-visualizer` 输出 report，定位并持续跟踪大依赖体积

---

## P3 — 性能优化

- [x] **优化 `BackgroundEffect` 噪声动画** ✅
  - ~~噪声动画从 0.3s steps(3) 降频至 4s steps(4)~~
  - ~~去除 noise / moon 层多余的 `will-change: transform`~~

- [x] **scroll handler 节流** ✅
  - ~~`ArticleView.tsx` 的 heading 追踪添加 `requestAnimationFrame` 节流~~

- [x] **顶栏 `backdrop-blur` 降级** ✅
  - ~~`backdrop-blur-xl` → `backdrop-blur-md`，配合背景色不透明度补偿~~

- [x] **跑马灯 GPU 合成提示** ✅
  - ~~两行跑马灯添加 `will-change-transform`~~

- [x] **页面路由级代码分割** — Next.js App Router 自动代码分割

- [ ] **Giscus 评论按需加载**
  - 默认折叠（按钮触发）或滚动到可视区再加载，减少第三方脚本开销

- [ ] **TOC active heading 用 IntersectionObserver**
  - `ArticleView.tsx`：当前仍用 scroll + rAF + `getBoundingClientRect`（第 37-59 行），每次回调都触发 forced layout，长文体感卡顿。
  - 改为 `IntersectionObserver` 注册一次，回调里维护 `activeId` 即可。

- [ ] **`react-syntax-highlighter` 按需加载语言** 🔴
  - 当前 `MarkdownRenderer.tsx` 使用 `Prism`（CJS 全量）+ `vscDarkPlus` 样式，所有语言定义随首屏 JS 一同下发。
  - 备选改法（按推荐顺序）：
    1. 切换 `shiki` 在构建期生成静态高亮 HTML（运行时 0 JS）；
    2. `PrismAsyncLight` + `registerLanguage` 仅注册实际用到的（ts/js/bash/md/css 等）；
    3. 用 `next/dynamic` 把代码块组件懒加载到正文出现后再下发。

- [ ] **Google Fonts 改用 `next/font/google`** 🆕 2026-06-08 🔴
  - 当前 `src/app/layout.tsx:36` 直接 `<link>` 到 Google CDN，未子集化、未指定 `font-display`，首屏阻塞且依赖外部网络。
  - 改用 `next/font/google` 自动自托管 + 子集化 + 零 CLS，删除手动 `preconnect`。

- [x] **文章正文按需加载** — Next.js SSG 每页独立构建，无需手动分割

- [ ] **`LayoutShell` 拆分 server / client** 🆕 2026-06-08
  - 当前 `src/components/LayoutShell.tsx` 整体 `'use client'`，导致所有页面被客户端组件包裹，breadcrumb 也在客户端渲染。
  - 把交互部分（汉堡菜单、search 高亮指示器）抽成独立的 client 子组件，让 `LayoutShell` 本身回到 server，由 `template.tsx` 直接使用。

- [ ] **动效支持 `prefers-reduced-motion`**
  - 对跑马灯/背景等高频动画提供降级，兼顾可访问性与低端设备。
  - 注：`globals.css` 已有全局降级，但跑马灯/`BackgroundEffect` 内联 `<style>` 内的动画未被覆盖，需要单独处理。

---

## P4 — 远期改进（借鉴 CellStack）

> 参考 [cellstack-analysis.md](./cellstack-analysis.md) §4.2–4.4 和 §六 路线图

- [ ] **Pagefind 全文搜索（替代 Fuse.js）**
  - 构建后对 `out/` 建倒排索引，运行时纯前端查询
  - 仅需 `postbuild: pagefind --site out`

- [ ] **封面图自动提取**
  - 当 frontmatter 未指定 `coverImage` 时，从正文首个 `![](url)` 自动提取
  - 减少写作时手动填写封面的负担

- [ ] **GitHub 热力图（About 页）**
  - 使用 `react-activity-calendar` 展示 GitHub 提交活跃度
  - 注意 API 稳定性和跨域

- [ ] **动画库升级（GSAP / Framer Motion）**
  - 将部分 CSS 动画升级为更精细的库驱动动画，提升视觉表现力

---

## 小改进

- [ ] `SkewButton` 增加 `-webkit-font-smoothing: antialiased`
- [ ] **`HomeClient` hash 锚点重写** 🆕 2026-06-08
  - 当前 `HomeClient.tsx:23-37` 用 `setTimeout` 50ms 递归自旋查找元素，写法脏且时序不可靠。
  - 改为 `useLayoutEffect` + `scrollIntoView`，或直接交给浏览器原生 hash 滚动。
- [ ] `ArticleView.tsx:70` 中 `scrollToHeading` 800ms 硬编码改用 `scrollend` 事件
- [ ] Favorites 图片的 `alt` 属性优化为更有语义的描述
- [ ] 分享复制兜底：`navigator.clipboard` 不可用时给出更友好提示/降级方案
- [ ] 多处 `<img>` 缺 `width / height` 属性会产生 CLS（logo、`user_admin.webp`、favorites 图）
- [ ] 抽出公共 `useInView` hook，合并 `FavoritesSection` / `AboutSection` 中重复的 IntersectionObserver 逻辑
