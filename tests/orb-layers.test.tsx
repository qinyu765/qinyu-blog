import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OrbLayers } from '../src/components/ui/OrbLayers';

test('OrbLayers 渲染独立月面、遮罩、外晕与无障碍粒子画布', () => {
  const markup = renderToStaticMarkup(<OrbLayers />);

  assert.match(markup, /p3r-orb-bloom/);
  assert.match(markup, /p3r-orb-light/);
  assert.match(markup, /p3r-orb-surface/);
  assert.match(markup, /p3r-orb-mask/);
  assert.match(markup, /<canvas[^>]*aria-hidden="true"/);
  assert.match(markup, /pointer-events-none/);
  assert.match(markup, /p3r-orb-wordmark[^>]*z-\[3\]/);
  assert.match(
    markup,
    /p3r-orb-surface[^>]*>[\s\S]*p3r-orb-mask[\s\S]*p3r-orb-wordmark/,
  );
});
