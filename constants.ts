import { BlogPost, Topic } from './types';
import { loadBlogPosts, loadTopics } from './lib/blog-loader';

export const BLOG_POSTS: BlogPost[] = loadBlogPosts();
export const TOPICS: Topic[] = loadTopics();

export const NAV_ITEMS = [
  { label: 'HOME', path: '/' },
  { label: 'BLOG', path: '/blog' },
  // { label: 'TOPICS', path: '/topics' },
  { label: 'ABOUT', path: '/#about' },
  { label: 'FAVORITES', path: '/#favorites' },
];
