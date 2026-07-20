import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '../site';
import { contentDateToDate } from './date';
import { listRoutableArticles } from './routes';
import type { ContentCatalog } from './types';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildRssXml(catalog: ContentCatalog, buildDate = new Date()): string {
  const articles = listRoutableArticles(catalog);
  const seenUrls = new Set<string>();

  const items = articles.map((article) => {
    const url = absoluteUrl(article.path);
    if (seenUrls.has(url)) throw new Error(`RSS contains duplicate URL: ${url}`);
    seenUrls.add(url);

    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <description>${escapeXml(article.excerpt)}</description>
      <pubDate>${contentDateToDate(article.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${buildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}
