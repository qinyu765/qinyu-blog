import assert from 'node:assert/strict';
import test from 'node:test';
import { getOrbMotionGeometry, shouldAnimateOrb } from '../src/lib/orb-motion';

test('只在首页大屏且未减少动画时启用开场', () => {
  assert.equal(shouldAnimateOrb({
    pathname: '/',
    viewportWidth: 1440,
    reducedMotion: false,
  }), true);
  assert.equal(shouldAnimateOrb({
    pathname: '/blog',
    viewportWidth: 1440,
    reducedMotion: false,
  }), false);
  assert.equal(shouldAnimateOrb({
    pathname: '/',
    viewportWidth: 1023,
    reducedMotion: false,
  }), false);
  assert.equal(shouldAnimateOrb({
    pathname: '/',
    viewportWidth: 1440,
    reducedMotion: true,
  }), false);
});

test('终点与现有 top/right/size 月球构图一致', () => {
  const geometry = getOrbMotionGeometry(1440, 900);

  assert.equal(geometry.targetSize, 630);
  assert.equal(geometry.targetTop, -162);
  assert.equal(geometry.targetLeft, 972);
  assert.ok(Math.abs(geometry.startCenterX - 835.2) < 0.001);
  assert.equal(geometry.startCenterY, 405);
  assert.equal(geometry.startSize, 522);
});
