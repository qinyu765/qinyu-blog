import { absoluteUrl } from '../site';
import { contentDateToDate } from './date';
import { blogPostPath, topicPath, topicPostPath } from './routes';
import type { ContentCatalog, Topic } from './types';

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency: 'daily' | 'weekly' | 'monthly';
  priority: number;
}

function latestTopicDate(topic: Topic): Date | undefined {
  const latest = topic.posts.reduce(
    (value, post) => post.date > value ? post.date : value,
    '',
  );
  return latest ? contentDateToDate(latest) : undefined;
}

export function buildSitemapEntries(catalog: ContentCatalog): SitemapEntry[] {
  const staticPages: SitemapEntry[] = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/blog'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/topics'), changeFrequency: 'weekly', priority: 0.8 },
  ];

  const blogPages = catalog.posts.map((post) => ({
    url: absoluteUrl(blogPostPath(post.id)),
    lastModified: contentDateToDate(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const topicPages = catalog.topics.map((topic) => ({
    url: absoluteUrl(topicPath(topic.meta.slug)),
    lastModified: latestTopicDate(topic),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const topicPostPages = catalog.topics.flatMap((topic) => topic.posts.map((post) => ({
    url: absoluteUrl(topicPostPath(topic.meta.slug, post.slug)),
    lastModified: contentDateToDate(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  })));

  const entries = [...staticPages, ...blogPages, ...topicPages, ...topicPostPages];
  const urls = entries.map((entry) => entry.url);
  if (new Set(urls).size !== urls.length) throw new Error('Sitemap contains duplicate URLs');
  return entries;
}
