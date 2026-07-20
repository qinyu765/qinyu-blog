/**
 * @file MCP 内容适配器。
 *
 * 解析和校验由共享内容层负责；该适配器只保留 MCP 原有的普通文章接口。
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContentCatalog } from '../src/lib/content/loader';
import type { BlogPost } from '../src/lib/content/types';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content');

export type Post = BlogPost;

/** 加载所有普通博客文章；MCP 暂不包含专题文章。 */
export function loadPosts(): Post[] {
  return loadContentCatalog({ contentDir: CONTENT_DIR, cache: false }).posts;
}

/** 按关键词搜索普通文章（标题 + 内容 + 摘要 + 标签）。 */
export function searchPosts(query: string): Post[] {
  const normalizedQuery = query.toLowerCase();

  return loadPosts().filter((post) =>
    post.title.toLowerCase().includes(normalizedQuery)
    || post.content.toLowerCase().includes(normalizedQuery)
    || post.excerpt.toLowerCase().includes(normalizedQuery)
    || post.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery))
  );
}
