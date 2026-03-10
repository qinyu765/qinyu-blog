/**
 * Build-time sitemap generator
 * Run: node scripts/generate-sitemap.mjs
 * Reads all markdown post files and generates a sitemap.xml
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://hflin.xyz';

// Collect static routes
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
];

// Collect blog post routes from content/posts
const postsDir = path.resolve(__dirname, '../content/posts');
const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const postRoutes = postFiles.map(file => {
  const id = file.replace('.md', '');
  const stat = fs.statSync(path.join(postsDir, file));
  const lastmod = stat.mtime.toISOString().split('T')[0];
  return {
    path: `/blog/${encodeURIComponent(id)}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod,
  };
});

const allRoutes = [...staticRoutes, ...postRoutes];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(r => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
${r.lastmod ? `    <lastmod>${r.lastmod}</lastmod>\n` : ''}\
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outPath = path.resolve(__dirname, '../public/sitemap.xml');
fs.writeFileSync(outPath, sitemap, 'utf-8');
console.log(`✅ Sitemap generated: ${outPath} (${allRoutes.length} URLs)`);
