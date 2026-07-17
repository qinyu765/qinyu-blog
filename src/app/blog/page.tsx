import { Suspense } from 'react';
import type { Metadata } from 'next';
import { loadBlogPosts } from '@/lib/blog-loader';
import { BlogListClient } from './BlogListClient';

export const metadata: Metadata = {
  title: 'Blog',
  description: '所有文章列表 — 计算机科学技术分享与实践',
};

export default function BlogPage() {
  const posts = loadBlogPosts();
  return (
    <Suspense>
      <BlogListClient posts={posts} />
    </Suspense>
  );
}
