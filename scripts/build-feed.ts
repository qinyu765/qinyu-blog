/** 构建时生成 RSS 2.0 Feed。 */

import fs from 'node:fs';
import path from 'node:path';
import { buildRssXml, loadContentCatalog } from '../src/lib/content/index';

const outputDir = path.join(process.cwd(), 'out');
const catalog = loadContentCatalog({ cache: true });
const xml = buildRssXml(catalog);
const topicPostCount = catalog.topics.reduce((count, topic) => count + topic.posts.length, 0);

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'feed.xml'), xml, 'utf8');
console.log(`✅ Generated feed.xml with ${catalog.posts.length + topicPostCount} items`);
