import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { BLOG_POSTS } from '../constants';
import { ArticleView } from '../components/ArticleView';
import { useSEO } from '../lib/use-seo';

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const postIndex = BLOG_POSTS.findIndex((p) => p.id === id);
  const post = postIndex !== -1 ? BLOG_POSTS[postIndex] : undefined;

  useSEO({
    title: post?.title ?? 'Blog',
    description: post?.excerpt,
    path: post ? `/blog/${post.id}` : '/blog',
  });

  if (!post) return <Navigate to="/" replace />;

  const prev = postIndex > 0 ? BLOG_POSTS[postIndex - 1] : undefined;
  const next = postIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[postIndex + 1] : undefined;

  return (
    <ArticleView
      post={post}
      backLink={{ to: '/blog', label: 'Return to Base' }}
      prevPost={prev ? { id: prev.id, title: prev.title, linkTo: `/blog/${prev.id}` } : undefined}
      nextPost={next ? { id: next.id, title: next.title, linkTo: `/blog/${next.id}` } : undefined}
    />
  );
};
