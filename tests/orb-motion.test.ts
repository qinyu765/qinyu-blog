import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getOrbAmbientIntensity,
  getOrbAmbientState,
  getOrbDepartureDuration,
  getOrbMotionGeometry,
  getOrbMotionState,
  getOrbScrollProgress,
  resolveOrbRouteTransition,
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

test('环境浮动在首页顶部保持全幅并在粒子消散前平滑归位', () => {
  assert.equal(getOrbAmbientIntensity(-1), 1);
  assert.equal(getOrbAmbientIntensity(0.08), 1);
  assert.ok(getOrbAmbientIntensity(0.45) > 0);
  assert.ok(getOrbAmbientIntensity(0.45) < 1);
  assert.equal(getOrbAmbientIntensity(0.82), 0);
  assert.equal(getOrbAmbientIntensity(2), 0);
});

test('三层满幅轨迹遵守约定范围且零强度回到统一月相', () => {
  const diameter = 600;
  const settled = getOrbAmbientState(4.2, 0, diameter);

  assert.deepEqual(settled, {
    bloom: { x: 0, y: 0, scale: 1, opacity: 0.9 },
    light: { x: 0, y: 0, scale: 1, opacity: 0.9 },
    surface: { x: 108, y: 0, scale: 1, opacity: 1 },
  });

  for (let step = 0; step <= 1200; step += 1) {
    const state = getOrbAmbientState(step / 20, 1, diameter);
    assert.ok(Math.abs(state.bloom.x) <= diameter * 0.055 + 1e-9);
    assert.ok(Math.abs(state.bloom.y) <= diameter * 0.045 + 1e-9);
    assert.ok(state.bloom.scale >= 0.94 - 1e-9);
    assert.ok(state.bloom.scale <= 1.08 + 1e-9);
    assert.ok(Math.abs(state.light.x) <= diameter * 0.04 + 1e-9);
    assert.ok(Math.abs(state.light.y) <= diameter * 0.06 + 1e-9);
    assert.ok(Math.abs(state.surface.x - diameter * 0.18) <= diameter * 0.07 + 1e-9);
    assert.ok(Math.abs(state.surface.y) <= diameter * 0.05 + 1e-9);
  }
});

test('离场时长按剩余距离缩短且保留最短收束时间', () => {
  assert.equal(getOrbDepartureDuration(0), 1.1);
  assert.equal(getOrbDepartureDuration(0.5), 0.55);
  assert.equal(getOrbDepartureDuration(0.95), 0.18);
  assert.equal(getOrbDepartureDuration(1), 0.18);
});

test('跨路由只在桌面动态月亮离开首页或返回首页时切换', () => {
  const routeContext = {
    previousPathname: '/',
    pathname: '/blog',
    previousHomeProgress: 0,
    viewportWidth: 1440,
    reducedMotion: false,
    enteringHomeAnchor: false,
  } as const;

  assert.equal(resolveOrbRouteTransition(routeContext), 'departing');
  assert.equal(resolveOrbRouteTransition({
    ...routeContext,
    previousHomeProgress: 0.98,
  }), 'none');
  assert.equal(resolveOrbRouteTransition({
    ...routeContext,
    previousPathname: '/blog',
    pathname: '/topics',
  }), 'none');
  assert.equal(resolveOrbRouteTransition({
    ...routeContext,
    previousPathname: '/blog',
    pathname: '/',
    previousHomeProgress: 1,
  }), 'returning');
  assert.equal(resolveOrbRouteTransition({
    ...routeContext,
    previousPathname: '/blog',
    pathname: '/',
    previousHomeProgress: 1,
    enteringHomeAnchor: true,
  }), 'none');
  assert.equal(resolveOrbRouteTransition({
    ...routeContext,
    viewportWidth: 1023,
  }), 'none');
  assert.equal(resolveOrbRouteTransition({
    ...routeContext,
    reducedMotion: true,
  }), 'none');
});
