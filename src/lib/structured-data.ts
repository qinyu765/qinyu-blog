import { blogPostPath, contentDateToIso } from '@/lib/content';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';
import type { BlogPost } from '@/types';

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'zh-CN',
  };
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'HF',
    url: SITE_URL,
  };
}

export function articleJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: contentDateToIso(post.date),
    url: absoluteUrl(blogPostPath(post.id)),
    author: {
      '@type': 'Person',
      name: 'HF',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'HF',
      url: SITE_URL,
    },
    ...(post.coverImage ? { image: post.coverImage } : {}),
    ...(post.tags ? { keywords: post.tags.join(', ') } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
