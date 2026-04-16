/**
 * @file 博客内容加载器 — 独立于 Next.js 的内容读取模块。
 *
 * 直接通过 Node.js fs + gray-matter 读取 content/posts/ 下的 Markdown 文件。
 * 不依赖 Next.js 路径别名或运行时环境。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

// 计算项目根目录（mcp-server/ 的上一级）
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(PROJECT_ROOT, 'content', 'posts');

/** 文章元数据 + 内容 */
export interface Post {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  tags?: string[];
}

/** 加载所有博客文章 */
export function loadPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts: Post[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { data, content } = matter(raw);

    const title = String(data.title ?? '');
    const date = String(data.date ?? '');
    const category = String(data.category ?? '');
    const excerpt = String(data.excerpt ?? '');

    if (!title || !date) continue;

    posts.push({
      id: file.replace('.md', ''),
      title, date, category, excerpt, content,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
    });
  }

  // 按日期降序排列
  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

/** 按关键词搜索文章（标题 + 内容 + 标签） */
export function searchPosts(query: string): Post[] {
  const posts = loadPosts();
  const q = query.toLowerCase();

  return posts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.content.toLowerCase().includes(q) ||
    p.excerpt.toLowerCase().includes(q) ||
    p.tags?.some(t => t.toLowerCase().includes(q))
  );
}
