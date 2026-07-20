import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { postFrontmatterSchema, topicFrontmatterSchema, topicPostFrontmatterSchema } from './schema';
import { listRoutableArticles } from './routes';
import type { BlogPost, ContentCatalog, Topic, TopicMeta, TopicPost } from './types';

export interface ContentValidationIssue {
  file: string;
  message: string;
}

export class ContentValidationError extends Error {
  readonly issues: ContentValidationIssue[];

  constructor(issues: ContentValidationIssue[]) {
    super(`内容校验失败：\n${issues.map((issue) => `- ${issue.file}: ${issue.message}`).join('\n')}`);
    this.name = 'ContentValidationError';
    this.issues = issues;
  }
}

export interface LoadContentOptions {
  contentDir?: string;
  cache?: boolean;
}

interface ParsedMarkdown {
  data: Record<string, unknown>;
  content: string;
}

const catalogCache = new Map<string, ContentCatalog>();

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function formatZodIssues(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || 'frontmatter'} ${issue.message}`)
    .join('; ');
}

function markdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter((file) => file.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
}

function parseMarkdownFile(
  filePath: string,
  issues: ContentValidationIssue[],
): ParsedMarkdown | undefined {
  try {
    const parsed = matter(fs.readFileSync(filePath, 'utf8'));
    return { data: parsed.data, content: parsed.content };
  } catch (error) {
    issues.push({ file: filePath, message: `无法解析 Markdown：${errorMessage(error)}` });
    return undefined;
  }
}

function loadBlogPosts(postsDir: string, issues: ContentValidationIssue[]): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const file of markdownFiles(postsDir)) {
    const filePath = path.join(postsDir, file);
    const markdown = parseMarkdownFile(filePath, issues);
    if (!markdown) continue;

    const parsed = postFrontmatterSchema.safeParse(markdown.data);
    if (!parsed.success) {
      issues.push({ file: filePath, message: formatZodIssues(parsed.error) });
      continue;
    }

    posts.push({
      id: path.basename(file, '.md'),
      ...parsed.data,
      content: markdown.content,
    });
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

function loadTopics(topicsDir: string, issues: ContentValidationIssue[]): Topic[] {
  if (!fs.existsSync(topicsDir)) return [];

  const topicDirs = fs.readdirSync(topicsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  const topics: Topic[] = [];

  for (const slug of topicDirs) {
    const topicDir = path.join(topicsDir, slug);
    const indexPath = path.join(topicDir, 'index.md');
    let topicMeta: Omit<TopicMeta, 'slug'> | undefined;
    let introContent: string | undefined;

    if (!fs.existsSync(indexPath)) {
      issues.push({ file: indexPath, message: '专题目录缺少 index.md' });
    } else {
      const markdown = parseMarkdownFile(indexPath, issues);
      if (markdown) {
        const parsedTopic = topicFrontmatterSchema.safeParse(markdown.data);
        if (parsedTopic.success) {
          topicMeta = parsedTopic.data;
          introContent = markdown.content || undefined;
        } else {
          issues.push({ file: indexPath, message: formatZodIssues(parsedTopic.error) });
        }
      }
    }

    const posts: TopicPost[] = [];
    for (const file of markdownFiles(topicDir).filter((name) => name !== 'index.md')) {
      const filePath = path.join(topicDir, file);
      const markdown = parseMarkdownFile(filePath, issues);
      if (!markdown) continue;

      const parsedPost = topicPostFrontmatterSchema.safeParse(markdown.data);
      if (!parsedPost.success) {
        issues.push({ file: filePath, message: formatZodIssues(parsedPost.error) });
        continue;
      }

      const postSlug = path.basename(file, '.md');
      posts.push({
        id: `${slug}/${postSlug}`,
        slug: postSlug,
        topicSlug: slug,
        ...parsedPost.data,
        content: markdown.content,
      });
    }

    posts.sort((a, b) => {
      if (a.order != null && b.order != null) return a.order - b.order;
      if (a.order != null) return -1;
      if (b.order != null) return 1;
      return b.date.localeCompare(a.date);
    });

    if (topicMeta) {
      topics.push({
        meta: { slug, ...topicMeta },
        posts,
        introContent,
      });
    }
  }

  return topics.sort((a, b) => {
    const latestDate = (topic: Topic) => topic.posts.reduce(
      (latest, post) => post.date > latest ? post.date : latest,
      '',
    );
    return latestDate(b).localeCompare(latestDate(a));
  });
}

function validateUniqueRoutes(catalog: ContentCatalog, issues: ContentValidationIssue[]): void {
  const routeOwners = new Map<string, string>();

  for (const article of listRoutableArticles(catalog)) {
    const existing = routeOwners.get(article.path);
    if (existing) {
      issues.push({
        file: article.id,
        message: `路由 ${article.path} 与 ${existing} 重复`,
      });
    } else {
      routeOwners.set(article.path, article.id);
    }
  }
}

export function loadContentCatalog(options: LoadContentOptions = {}): ContentCatalog {
  const contentDir = path.resolve(options.contentDir ?? path.join(process.cwd(), 'content'));
  const useCache = options.cache ?? process.env.NODE_ENV === 'production';
  const cached = useCache ? catalogCache.get(contentDir) : undefined;
  if (cached) return cached;

  const issues: ContentValidationIssue[] = [];
  const catalog: ContentCatalog = {
    posts: loadBlogPosts(path.join(contentDir, 'posts'), issues),
    topics: loadTopics(path.join(contentDir, 'topics'), issues),
  };

  validateUniqueRoutes(catalog, issues);
  if (issues.length > 0) throw new ContentValidationError(issues);

  if (useCache) catalogCache.set(contentDir, catalog);
  return catalog;
}

export function clearContentCache(): void {
  catalogCache.clear();
}
