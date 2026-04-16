/**
 * @file 博客 MCP Server — 将博客内容暴露为可查询工具。
 *
 * 提供 3 个 tool：
 *   - list_posts：列出所有文章摘要
 *   - read_post：读取指定文章完整内容
 *   - search_posts：按关键词搜索文章
 *
 * 传输方式：stdio（本地子进程）
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadPosts, searchPosts } from './content-loader.js';

// ─── 创建 MCP Server ──────────────────────────────────────────────────────

const server = new McpServer({
  name: 'p3r-blog',
  version: '0.1.0',
});

// ─── Tool: list_posts ─────────────────────────────────────────────────────

server.tool(
  'list_posts',
  '列出所有博客文章的摘要信息（标题、日期、分类、摘要、标签）',
  { category: z.string().optional().describe('按分类过滤，如 TECH / LIFE / MEMO') },
  async ({ category }) => {
    let posts = loadPosts();

    if (category) {
      posts = posts.filter(p =>
        p.category.toUpperCase() === category.toUpperCase()
      );
    }

    const summary = posts.map(p => ({
      id: p.id,
      title: p.title,
      date: p.date,
      category: p.category,
      excerpt: p.excerpt,
      tags: p.tags ?? [],
    }));

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(summary, null, 2),
      }],
    };
  },
);

// ─── Tool: read_post ──────────────────────────────────────────────────────

server.tool(
  'read_post',
  '读取指定博客文章的完整 Markdown 内容',
  { id: z.string().describe('文章 ID（即文件名，不含 .md 后缀）') },
  async ({ id }) => {
    const posts = loadPosts();
    const post = posts.find(p => p.id === id);

    if (!post) {
      return {
        content: [{
          type: 'text' as const,
          text: `未找到 ID 为 "${id}" 的文章。可用的文章 ID：${posts.map(p => p.id).join(', ')}`,
        }],
        isError: true,
      };
    }

    const header = [
      `# ${post.title}`,
      `日期：${post.date} | 分类：${post.category}`,
      post.tags?.length ? `标签：${post.tags.join(', ')}` : '',
      `摘要：${post.excerpt}`,
      '---',
    ].filter(Boolean).join('\n');

    return {
      content: [{
        type: 'text' as const,
        text: `${header}\n\n${post.content}`,
      }],
    };
  },
);

// ─── Tool: search_posts ───────────────────────────────────────────────────

server.tool(
  'search_posts',
  '按关键词搜索博客文章（搜索标题、内容、摘要、标签）',
  { query: z.string().describe('搜索关键词') },
  async ({ query }) => {
    const results = searchPosts(query);

    if (results.length === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: `未找到包含 "${query}" 的文章。`,
        }],
      };
    }

    const summary = results.map(p => ({
      id: p.id,
      title: p.title,
      date: p.date,
      category: p.category,
      excerpt: p.excerpt,
    }));

    return {
      content: [{
        type: 'text' as const,
        text: `找到 ${results.length} 篇匹配文章：\n\n${JSON.stringify(summary, null, 2)}`,
      }],
    };
  },
);

// ─── 启动 Server ──────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[p3r-blog MCP] Server started on stdio');
}

main().catch((err) => {
  console.error('[p3r-blog MCP] Fatal error:', err);
  process.exit(1);
});
