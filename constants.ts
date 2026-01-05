import { BlogPost } from './types';
import { loadBlogPosts } from './lib/blog-loader';

export const BLOG_POSTS: BlogPost[] = loadBlogPosts();

export const NAV_ITEMS = [
  { label: 'HOME', path: '/' },
  { label: 'BLOG', path: '/blog' },
  { label: 'ABOUT', path: '/about' },
];