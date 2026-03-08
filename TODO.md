# 项目优化 TODO

> 此文件记录待处理的项目优化项，按优先级排列。

---

## P1 — 代码质量

- [ ] **拆分 `Home.tsx`（413 行巨型组件）**
  - 拆为 `HeroSection`、`RecentLogs`、`AboutSection`、`FavoritesSection`
  - 技能数据（skills 数组）抽取到 `constants.ts`
  - Favorites 图片解析逻辑抽取到 `lib/` 工具函数

- [ ] **提取跑马灯卡片组件**
  - `Home.tsx` L190-258 的 Row1 / Row2 卡片几乎完全相同
  - 提取为 `MarqueePostCard` 组件

- [ ] **删除注释掉的 Dead Code**
  - `Home.tsx` L129-134、L270、L284-287、L357-362
  - `Layout.tsx` L51

- [ ] **统一 SVG 背景纹理**
  - `Home.tsx`、`ArticleView.tsx`、`TopicDetail.tsx`、`TopicList.tsx` 中重复的 Base64 SVG
  - 定义为全局 Tailwind utility class（如 `bg-p3r-crosshatch`）

---

## P2 — 工程化

- [ ] **添加 ESLint + Prettier**
  - 推荐 `@eslint/js` + `typescript-eslint`
  - 可选 Husky + lint-staged pre-commit

- [ ] **统一换行符为 LF**
  - 部分文件 CRLF（`tailwind.config.js`、`index.css`）
  - 添加 `.editorconfig`

- [ ] **改善 SEO 标签**
  - `<title>` 从 "HF" 改为更有意义的标题
  - 添加 `<meta name="description">`
  - 可选：`react-helmet-async` 实现每页动态 title

- [ ] **检查 `tsconfig.json` 严格模式**
  - 确保 `strict: true`、`noUncheckedIndexedAccess`

---

## P3 — 性能优化

- [ ] **优化 `BackgroundEffect` 噪声动画**
  - `.p3r-noise` 的 0.3s 步帧动画持续消耗 GPU
  - 考虑移动端禁用或降低帧率

- [ ] **`react-syntax-highlighter` 按需加载语言**
  - 当前全量加载 Prism 语言定义
  - 改为仅注册 `tsx`、`js`、`css`、`bash` 等常用语言

- [ ] **文章正文按需加载（延后）**
  - 当前 `constants.ts` 同步加载全部 Markdown 内容
  - 文章少（9 篇）时影响不大，增长后需拆分

---

## 小改进

- [ ] `SkewButton` 增加 `-webkit-font-smoothing: antialiased`
- [ ] `Home.tsx` hash 滚动重试改用 `requestAnimationFrame`
- [ ] `scrollToHeading` 800ms 硬编码改用 `scrollend` 事件
- [ ] Favorites 图片的 `alt` 属性优化为更有语义的描述
