import { absoluteUrl } from '../site';
import type { ContentCatalog, RoutableArticle } from './types';

function encodeSegment(segment: string): string {
  return encodeURIComponent(segment);
}

export function blogPostPath(id: string): string {
  return `/blog/${encodeSegment(id)}`;
}

export function topicPath(topicSlug: string): string {
  return `/topics/${encodeSegment(topicSlug)}`;
}

export function topicPostPath(topicSlug: string, postSlug: string): string {
  return `${topicPath(topicSlug)}/${encodeSegment(postSlug)}`;
}

export { absoluteUrl };

export function listRoutableArticles(catalog: ContentCatalog): RoutableArticle[] {
  const blogArticles: RoutableArticle[] = catalog.posts.map((post) => ({
    kind: 'blog',
    id: post.id,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    path: blogPostPath(post.id),
  }));

  const topicArticles = catalog.topics.flatMap((topic) => topic.posts.map((post) => ({
    kind: 'topic' as const,
    id: post.id,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    path: topicPostPath(topic.meta.slug, post.slug),
  })));

  return [...blogArticles, ...topicArticles]
    .sort((a, b) => b.date.localeCompare(a.date));
}
