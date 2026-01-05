# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally

## Architecture Overview

This is a **Persona 3 Reload-inspired blog** built with React 19, Vite, and TypeScript. The design aesthetic heavily features:

- **Skewed/transformed UI elements** using `transform: skewX(-12deg)` - particularly the navigation buttons and date indicator
- **High contrast color palette**: Deep Navy Blue (#0055FF), Bright Cyan (#00FFFF), Stark White, Dark (#0a0a1a)
- **Diegetic UI design** - interface elements styled as in-game system menus
- **Hash-based routing** via `react-router-dom` (HashRouter) for static deployment compatibility

## Key Architectural Decisions

### Routing
Uses `HashRouter` instead of `BrowserRouter` for GitHub Pages compatibility. Routes are defined in `App.tsx` with a fallback to `/`.

### Styling
**No CSS files or Tailwind config** - Tailwind CSS is loaded via CDN in `index.html`, and all custom configuration (colors, fonts, animations) is embedded directly in the HTML's `<script>` tag. The color tokens are:
- `p3blue`: #0055FF
- `p3cyan`: #00FFFF
- `p3dark`: #0a0a1a
- `p3white`: #F0F0F0

Fonts are Google Fonts: **Anton** (display) and **Roboto Condensed** (body).

### Content Management
Blog posts are **hardcoded in `constants.ts`** as the `BLOG_POSTS` array. Each post contains:
- `id`: URL slug
- `title`, `date`, `category` ('TECH' | 'LIFE' | 'MEMO')
- `excerpt`: For list view
- `content`: Markdown string rendered via `react-markdown`
- `coverImage`: Optional image URL

### Component Structure

**Layout** (`components/Layout.tsx`): Wraps all routes, contains:
- Fixed header with skewed date indicator (top-left)
- Skewed navigation buttons (top-right)
- Breadcrumb path indicator showing current route
- Floating footer vitals

**Pages** (`pages/`): Home, BlogList, BlogPost, About - all rendered through `<Outlet />` in Layout

**UI Components** (`components/ui/`):
- `SkewButton`: Navigation link with signature -12deg skew transform
- `BackgroundEffect`: Fixed background with moon motifs and reflection lines
- `MarkdownRenderer`: Custom-styled `react-markdown` with P3R-themed components

### Module Resolution
Uses **ESM imports via importmap** in `index.html` pointing to `esm.sh` CDN rather than npm-installed modules. The `@/*` path alias resolves to the project root.

## When Modifying This Codebase

### Adding Blog Posts
Create a new Markdown file in `content/posts/` directory. Each post requires YAML frontmatter:

```markdown
---
title: "Post Title"
date: "2024.12.29"
category: "TECH"
coverImage: "https://..."  # Optional
excerpt: "Brief summary for list view"
---

# Article Title

Article content in Markdown...
```

The filename becomes the URL slug (e.g., `my-post.md` → `/#/blog/my-post`).

### Other Modifications
- **Styling changes**: Modify Tailwind config in `index.html` or use existing color tokens (p3blue, p3cyan, p3dark, p3white)
- **Skew transforms**: The signature -12deg skew is applied to containers; text is counter-skewed with `skew-x-12` to remain readable
- **Markdown rendering**: Customize components in `MarkdownRenderer.tsx` to match the diegetic UI aesthetic
