export const dynamic = 'force-static';

import type { MetadataRoute } from 'next';
import { buildSitemapEntries, loadContentCatalog } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(loadContentCatalog());
}
