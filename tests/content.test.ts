import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  ContentValidationError,
  blogPostPath,
  buildRssXml,
  buildSitemapEntries,
  listRoutableArticles,
  loadContentCatalog,
  topicPostPath,
  topicPath,
} from '../src/lib/content/index';
import { loadPosts as loadMcpPosts } from '../mcp-server/content-loader';

function createFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qinyu-blog-content-'));
  fs.mkdirSync(path.join(root, 'posts'), { recursive: true });
  fs.mkdirSync(path.join(root, 'topics', 'react deep'), { recursive: true });

  fs.writeFileSync(path.join(root, 'posts', '较早 article.md'), `---
title: 较早文章
date: "2026.01.01"
category: TECH
excerpt: 较早摘要
tags: [React]
---
较早正文
`);
  fs.writeFileSync(path.join(root, 'posts', '较新.md'), `---
title: 较新文章
date: "2026.03.01"
category: LIFE
excerpt: 较新摘要
---
较新正文
`);
  fs.writeFileSync(path.join(root, 'topics', 'react deep', 'index.md'), `---
title: React 专题
description: 专题描述
---
专题介绍
`);
  fs.writeFileSync(path.join(root, 'topics', 'react deep', 'later.md'), `---
title: Later
date: "2026.04.01"
category: TECH
excerpt: Later excerpt
order: 2
---
Later content
`);
  fs.writeFileSync(path.join(root, 'topics', 'react deep', 'first hook.md'), `---
title: First
date: "2026.02.01"
category: TECH
excerpt: First excerpt
order: 1
---
First content
`);

  return root;
}

test('统一内容层校验并按既有规则排序', (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const catalog = loadContentCatalog({ contentDir: root, cache: false });

  assert.deepEqual(catalog.posts.map((post) => post.title), ['较新文章', '较早文章']);
  assert.deepEqual(catalog.topics[0].posts.map((post) => post.title), ['First', 'Later']);
  assert.equal(catalog.topics[0].introContent?.trim(), '专题介绍');
});

test('内容错误会聚合并阻止构建', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qinyu-blog-invalid-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'posts'), { recursive: true });
  fs.mkdirSync(path.join(root, 'topics', 'missing-index'), { recursive: true });

  fs.writeFileSync(path.join(root, 'posts', 'invalid.md'), `---
title: ""
date: "2026.02.30"
category: OTHER
---
正文
`);
  fs.writeFileSync(path.join(root, 'posts', 'broken-yaml.md'), `---
title: [
---
正文
`);

  assert.throws(
    () => loadContentCatalog({ contentDir: root, cache: false }),
    (error) => {
      assert.ok(error instanceof ContentValidationError);
      assert.match(error.message, /title/);
      assert.match(error.message, /date/);
      assert.match(error.message, /category/);
      assert.match(error.message, /excerpt/);
      assert.match(error.message, /缺少 index\.md/);
      assert.match(error.message, /无法解析 Markdown/);
      return true;
    },
  );
});

test('专题文章 order 必须是整数', (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, 'topics', 'react deep', 'later.md');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('order: 2', 'order: 1.5'));

  assert.throws(
    () => loadContentCatalog({ contentDir: root, cache: false }),
    (error) => error instanceof ContentValidationError && /order/.test(error.message),
  );
});

test('路由函数逐段编码中文、空格和特殊字符', () => {
  assert.equal(blogPostPath('中文 article'), '/blog/%E4%B8%AD%E6%96%87%20article');
  assert.equal(topicPath('react/deep'), '/topics/react%2Fdeep');
  assert.equal(
    topicPostPath('react deep', 'hooks#闭包'),
    '/topics/react%20deep/hooks%23%E9%97%AD%E5%8C%85',
  );
});

test('RSS 与 sitemap 覆盖所有可访问文章且 URL 唯一', (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const catalog = loadContentCatalog({ contentDir: root, cache: false });
  const articles = listRoutableArticles(catalog);
  const rss = buildRssXml(catalog, new Date('2026-07-20T00:00:00Z'));
  const sitemap = buildSitemapEntries(catalog);

  const guidUrls = [...rss.matchAll(/<guid isPermaLink="true">([^<]+)<\/guid>/g)]
    .map((match) => match[1]);
  assert.equal(guidUrls.length, articles.length);
  assert.equal(new Set(guidUrls).size, articles.length);
  assert.ok(guidUrls.some((url) => url.endsWith('/topics/react%20deep/first%20hook')));
  assert.ok(guidUrls.some((url) => url.endsWith('/topics/react%20deep/later')));

  const sitemapUrls = sitemap.map((entry) => entry.url);
  assert.equal(sitemapUrls.length, 3 + catalog.posts.length + catalog.topics.length + 2);
  assert.equal(new Set(sitemapUrls).size, sitemapUrls.length);
  for (const url of guidUrls) assert.ok(sitemapUrls.includes(url));

  const topicEntry = sitemap.find((entry) => entry.url.endsWith('/topics/react%20deep'));
  assert.equal(topicEntry?.lastModified?.toISOString(), '2026-04-01T00:00:00.000Z');
});

test('MCP 适配器保持普通文章范围和原有 ID', () => {
  const posts = loadMcpPosts();
  assert.ok(posts.length > 0);
  assert.ok(posts.every((post) => !post.id.includes('/')));
  assert.ok(posts.every((post) => post.title && post.excerpt && post.category));
});
