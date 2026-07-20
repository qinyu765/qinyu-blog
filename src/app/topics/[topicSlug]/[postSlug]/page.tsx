import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleView } from '@/components/ArticleView';
import { loadTopics } from '@/lib/blog-loader';
import { topicPath, topicPostPath } from '@/lib/content/routes';

interface Props {
  params: Promise<{ topicSlug: string; postSlug: string }>;
}

export async function generateStaticParams() {
  const topics = loadTopics();
  const params: { topicSlug: string; postSlug: string }[] = [];

  for (const topic of topics) {
    for (const post of topic.posts) {
      params.push({ topicSlug: topic.meta.slug, postSlug: post.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicSlug: rawTopicSlug, postSlug: rawPostSlug } = await params;
  const topicSlug = decodeURIComponent(rawTopicSlug);
  const postSlug = decodeURIComponent(rawPostSlug);
  const topics = loadTopics();
  const topic = topics.find((t) => t.meta.slug === topicSlug);
  const post = topic?.posts.find((p) => p.slug === postSlug);

  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} — ${topic!.meta.title}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
  };
}

export default async function TopicPostPage({ params }: Props) {
  const { topicSlug: rawTopicSlug, postSlug: rawPostSlug } = await params;
  const topicSlug = decodeURIComponent(rawTopicSlug);
  const postSlug = decodeURIComponent(rawPostSlug);
  const topics = loadTopics();
  const topic = topics.find((t) => t.meta.slug === topicSlug);

  if (!topic) notFound();

  const postIndex = topic.posts.findIndex((p) => p.slug === postSlug);
  if (postIndex === -1) notFound();

  const post = topic.posts[postIndex];
  const prev = postIndex > 0 ? topic.posts[postIndex - 1] : undefined;
  const next = postIndex < topic.posts.length - 1 ? topic.posts[postIndex + 1] : undefined;

  return (
    <ArticleView
      post={post}
      backLink={{ to: topicPath(topicSlug), label: topic.meta.title }}
      prevPost={prev ? { id: prev.slug, title: prev.title, linkTo: topicPostPath(topicSlug, prev.slug) } : undefined}
      nextPost={next ? { id: next.slug, title: next.title, linkTo: topicPostPath(topicSlug, next.slug) } : undefined}
    />
  );
}
