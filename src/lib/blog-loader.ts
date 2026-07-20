import { loadContentCatalog } from '@/lib/content';
import type { BlogPost, Topic } from '@/types';

export function loadBlogPosts(): BlogPost[] {
  return loadContentCatalog().posts;
}

export function loadTopics(): Topic[] {
  return loadContentCatalog().topics;
}
