import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getOrbMotionGeometry,
  getOrbMotionState,
  getOrbScrollProgress,
  shouldAnimateOrb,
} from '../src/lib/orb-motion';

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
  assert.equal(geometry.startCenterX, 720);
  assert.equal(geometry.startCenterY, 405);
  assert.equal(geometry.startSize, 522);
});

test('重建动画时从当前滚动进度恢复且边界会被夹紧', () => {
  const geometry = getOrbMotionGeometry(1440, 900);

  assert.equal(getOrbScrollProgress(-20, 900), 0);
  assert.equal(getOrbScrollProgress(450, 900), 0.5);
  assert.equal(getOrbScrollProgress(1200, 900), 1);
  assert.equal(getOrbScrollProgress(1200, 0), 1);

  assert.deepEqual(getOrbMotionState(geometry, 0.5), {
    x: (geometry.startLeft + geometry.targetLeft) / 2,
    y: (geometry.startTop + geometry.targetTop) / 2,
    scale: (geometry.startScale + 1) / 2,
  });
});
