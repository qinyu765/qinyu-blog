# SEO 优化实践记录

本文档记录了本博客项目在 SEO 方面做了哪些改进，以及每项改进背后的原理。

---

## 一、什么是 SEO？

SEO（Search Engine Optimization，搜索引擎优化）的核心目标只有一个：**让搜索引擎能够发现、理解、并优先展示你的页面**。

搜索引擎的工作流程可以简化为三步：

```
爬取（Crawl） → 索引（Index） → 排名（Rank）
```

- **爬取**：搜索引擎的爬虫（Googlebot、Baiduspider 等）通过 URL 访问你的页面，下载 HTML 内容
- **索引**：解析 HTML，提取标题、正文、链接等信息，存入数据库
- **排名**：用户搜索时，根据相关性、质量、权威性等因素决定哪些页面排在前面

这意味着：**如果爬虫都打不开你的页面（或打开后看到的是空白），后面两步压根不会发生。**

---

## 二、SPA 的 SEO 天然缺陷

### 2.1 服务端返回的是什么？

传统网站（如 WordPress）是服务端渲染（SSR）的：用户请求 `/blog/xxx`，服务器返回一份**包含完整内容的 HTML**。爬虫拿到就能直接解析。

但我们的博客是 React SPA（Single Page Application），用 Vite 构建。服务端返回的 HTML 长这样：

```html
<!DOCTYPE html>
<html>
<head>
  <title>HF</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/index.tsx"></script>
</body>
</html>
```

注意 `<body>` 里**几乎没有任何内容**，只有一个空的 `<div id="root">`。所有页面内容（博客文章、列表、导航）都是 JavaScript 在浏览器端动态生成的。

爬虫看到的就是这个空壳。虽然 Google 的爬虫能执行 JavaScript，但有两个问题：
1. **执行 JS 有延迟**，Google 使用一个叫 Web Rendering Service 的队列来处理，可能延迟几分钟到数天
2. **不保证完整执行**，复杂的 JS 可能超时或报错

### 2.2 CSR vs SSR vs SSG

| 渲染方式 | 全称 | HTML 内容 | SEO 效果 |
|---------|------|----------|---------|
| **CSR** | Client-Side Rendering | 空壳，JS 在浏览器端渲染 | ❌ 最差 |
| **SSR** | Server-Side Rendering | 服务器每次请求时动态生成完整 HTML | ✅ 好 |
| **SSG** | Static Site Generation | 构建时预生成所有页面的完整 HTML | ✅ 最好 |

我们的博客目前是 **CSR**，这是 SEO 最不友好的方式。不过通过下面的一系列优化，可以在不切换架构的前提下显著改善。

---

## 三、HashRouter → BrowserRouter

### 3.1 问题：HashRouter 的 URL 搜索引擎看不见

改动前我们使用的是 React Router 的 `HashRouter`，URL 长这样：

```
https://hflin.xyz/#/blog/从零实现_React
```

`#` 符号在 HTTP 协议中叫做 **fragment identifier**（片段标识符）。它有一个关键特性：**浏览器不会把 `#` 后面的内容发送给服务器**。

这意味着：
- `https://hflin.xyz/#/blog/article-1`
- `https://hflin.xyz/#/blog/article-2`
- `https://hflin.xyz/#/about`

在服务器和搜索引擎眼里，这三个 URL **完全相同**，都是 `https://hflin.xyz/`。9 篇博客文章？对 Google 来说只有 1 个页面。

### 3.2 解决：切换到 BrowserRouter

`BrowserRouter` 使用 HTML5 History API（`pushState` / `replaceState`），URL 变成：

```
https://hflin.xyz/blog/从零实现_React
```

没有 `#`，每篇文章有**独立的、完整的 URL**。搜索引擎可以分别爬取和索引它们。

```tsx
// 改动前
import { HashRouter } from 'react-router-dom';
<HashRouter> ... </HashRouter>

// 改动后
import { BrowserRouter } from 'react-router-dom';
<BrowserRouter> ... </BrowserRouter>
```

### 3.3 GitHub Pages 的 SPA 路由问题

切换到 `BrowserRouter` 后会遇到一个新问题：当用户直接访问 `https://hflin.xyz/blog/xxx`（比如刷新页面或从外部链接进入），GitHub Pages 会返回 **404**——因为服务器上不存在 `/blog/xxx` 这个文件。

解决方案是利用 GitHub Pages 的 404 机制做一个 **redirect hack**：

1. **`public/404.html`**：当 GitHub Pages 找不到文件时会渲染这个页面。我们在里面放一段 JS，把当前路径编码成 query string，重定向到首页：
   ```
   /blog/xxx  →  /?/blog/xxx
   ```

2. **`index.html` 中的恢复脚本**：检测 query string 里的路径信息，用 `history.replaceState` 恢复到正确的 URL：
   ```
   /?/blog/xxx  →  /blog/xxx（浏览器地址栏显示）
   ```

整个过程对用户来说是无感的——地址栏始终显示正确的 URL。

---

## 四、Meta 标签

### 4.1 `<title>` 标签

这是 SEO 中最重要的单个标签。搜索结果的蓝色可点击标题就是 `<title>` 的内容。

改动前：
```html
<title>HF</title>  <!-- 所有页面都显示这个 -->
```

改动后：每个页面动态设置自己的标题：
```
首页:     "首页 | HF's Blog"
博客列表:  "Blog | HF's Blog"
文章页:    "从零实现 React：理解框架背后的设计 | HF's Blog"
```

### 4.2 `<meta name="description">`

这是搜索结果里标题下面的那段灰色描述文字。虽然 Google 可能会自己从页面内容中提取，但提供一个明确的 description 能增加展示你想要的内容的概率。

```html
<meta name="description" content="通过手写迷你 React，拆解 Fiber、Reconciliation 与 Hooks 的核心原理">
```

### 4.3 Open Graph 标签

Open Graph（OG）标签不直接影响搜索排名，但决定了你的链接在**社交媒体上分享时的展示效果**（微信、Twitter、Telegram、Discord 等）。

```html
<meta property="og:title" content="从零实现 React">
<meta property="og:description" content="拆解 Fiber 与 Hooks 的核心原理">
<meta property="og:type" content="article">
<meta property="og:url" content="https://hflin.xyz/blog/xxx">
```

没有 OG 标签时，分享链接只会显示一个光秃秃的 URL；有了之后会展示标题、描述和预览图的**富卡片**。

### 4.4 实现方式：useSEO Hook

由于我们是 SPA，不同页面的 meta 标签需要在路由切换时用 JS 动态更新。我们封装了一个 `useSEO` hook：

```tsx
// lib/use-seo.ts
export function useSEO({ title, description, path }) {
  useEffect(() => {
    document.title = `${title} | HF's Blog`;
    // 更新 meta description、og:title 等...
  }, [title, description, path]);
}

// 在每个页面组件中调用
useSEO({
  title: post.title,
  description: post.excerpt,
  path: `/blog/${post.id}`,
});
```

---

## 五、robots.txt

`robots.txt` 是放在网站根目录的一个纯文本文件，告诉搜索引擎爬虫：**哪些页面可以爬，哪些不要爬**。

爬虫访问你的网站时，第一件事就是请求 `https://hflin.xyz/robots.txt`。

```txt
User-agent: *      # 适用于所有爬虫
Allow: /            # 允许爬取所有路径

Sitemap: https://hflin.xyz/sitemap.xml   # 告诉爬虫站点地图的位置
```

常见用法：
```txt
# 禁止爬取管理后台
Disallow: /admin/

# 禁止爬取搜索结果页（避免重复内容）
Disallow: /search?

# 只允许 Google 爬取
User-agent: Googlebot
Allow: /
User-agent: *
Disallow: /
```

> ⚠️ `robots.txt` 是一个"君子协定"——正规搜索引擎会遵守，但恶意爬虫可以无视它。它不是安全机制。

---

## 六、sitemap.xml

### 6.1 是什么？

站点地图是一个 XML 文件，列出网站上所有你希望搜索引擎索引的 URL。它像一份"菜单"，帮助爬虫高效地发现所有页面，而不需要通过链接一层层点进去。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hflin.xyz/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://hflin.xyz/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hflin.xyz/blog/从零实现_React_理解框架背后的设计</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

各字段含义：
- `<loc>`：页面 URL
- `<lastmod>`：最后修改时间，帮助搜索引擎判断是否需要重新爬取
- `<changefreq>`：预估更新频率（`daily`/`weekly`/`monthly`），仅供参考
- `<priority>`：页面相对重要性（0.0 ~ 1.0），仅在站内比较，不影响跨站排名

### 6.2 自动生成

手动维护 sitemap 太容易遗漏。我们写了一个 Node.js 构建脚本 `scripts/generate-sitemap.mjs`，在每次 `pnpm build` 前自动扫描 `content/posts/` 目录，生成最新的 sitemap：

```json
{
  "scripts": {
    "prebuild": "node scripts/generate-sitemap.mjs",
    "build": "vite build"
  }
}
```

`prebuild` 是 npm/pnpm 的生命周期钩子——执行 `pnpm build` 时会**自动先执行** `prebuild`。

---

## 七、Google Search Console

Google Search Console（GSC）是 Google 提供的免费工具，让你了解网站在 Google 搜索中的表现。

### 7.1 核心功能

- **索引状态**：查看 Google 索引了你的哪些页面、哪些失败了，以及失败原因
- **搜索表现**：你的页面出现在哪些关键词的搜索结果中、展示次数、点击次数
- **站点地图管理**：提交 sitemap，让 Google 知道你有哪些页面
- **核心网页指标**：页面加载速度、交互响应等性能指标
- **移动适用性**：检查页面在移动设备上是否可用

### 7.2 我们做了什么

1. 注册了 `hflin.xyz` 的域名资源
2. 通过 DNS TXT 记录完成了所有权验证
3. 在站点地图页面提交了 `https://hflin.xyz/sitemap.xml`

提交后，Google 会在 1-7 天内开始爬取和索引提交的 URL。

---

## 八、改动文件清单

| 文件 | 类型 | 用途 |
|------|------|------|
| `App.tsx` | 修改 | `HashRouter` → `BrowserRouter` |
| `public/404.html` | 新建 | GitHub Pages SPA 路由 fallback |
| `index.html` | 修改 | 添加 meta 标签 + redirect 恢复脚本 |
| `public/robots.txt` | 新建 | 搜索引擎爬取规则 |
| `public/sitemap.xml` | 自动生成 | 站点地图 |
| `scripts/generate-sitemap.mjs` | 新建 | 构建时自动生成 sitemap |
| `lib/use-seo.ts` | 新建 | 通用 SEO hook，动态设置 title/meta |
| `pages/Home.tsx` | 修改 | 接入 useSEO |
| `pages/BlogList.tsx` | 修改 | 接入 useSEO |
| `pages/BlogPost.tsx` | 修改 | 接入 useSEO |
| `package.json` | 修改 | 添加 prebuild 脚本 |

---

## 九、仍然存在的限制与后续方向

当前的优化已经让搜索引擎"能看见"我们的页面了，但仍然是 CSR 架构，存在以下局限：

1. **首屏 HTML 仍然是空的**：爬虫需要执行 JS 才能看到内容，虽然 Google 能做到，但百度等爬虫可能不行
2. **没有结构化数据（JSON-LD）**：结构化数据能让搜索结果展示"富摘要"（发布日期、作者、面包屑导航等）
3. **没有 `canonical` 标签**：如果同一篇文章可以通过多个 URL 访问，缺少 canonical 可能导致权重分散

长期来看，如果 SEO 是重要目标，最佳方案是迁移到 **SSG 框架**（如 Astro），在构建时就把每个页面的完整 HTML 生成出来，让爬虫不需要执行任何 JS 就能读到全部内容。
