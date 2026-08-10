import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeroSection } from '../src/components/home/HeroSection';

test('Hero 渲染一视口触发区且 Featured 面板没有模糊外圈', () => {
  const markup = renderToStaticMarkup(
    <HeroSection
      latestPost={{
        id: 'entry',
        title: '测试文章',
        date: '2026.08.10',
        category: 'TECH',
        excerpt: '用于验证首页布局。',
        content: '',
      }}
    />,
  );

  assert.match(markup, /data-home-orb-trigger="true"/);
  assert.match(markup, /lg:min-h-\[calc\(100svh-5rem\)\]/);
  assert.doesNotMatch(markup, /blur-lg|bg-p3cyan\/30/);
});
