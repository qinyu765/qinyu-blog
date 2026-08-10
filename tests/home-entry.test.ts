import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getHomeNavigationIntent,
  reduceHomeEntryIntent,
  reduceHomeIntroKey,
  resolveOrbEntryMode,
} from '../src/lib/home-entry';

const desktopHome = {
  pathname: '/',
  pendingHomeSection: null,
  hash: '',
  viewportWidth: 1440,
  reducedMotion: false,
} as const;

test('普通桌面首页进入 intro 模式', () => {
  assert.equal(resolveOrbEntryMode(desktopHome), 'intro');
});

test('跨页区块意图和直接 hash 进入 anchor 模式', () => {
  assert.equal(resolveOrbEntryMode({
    ...desktopHome,
    pendingHomeSection: 'about',
  }), 'anchor');
  assert.equal(resolveOrbEntryMode({
    ...desktopHome,
    hash: '#favorites',
  }), 'anchor');
});

test('非首页、移动端和减少动画进入 resting 模式', () => {
  assert.equal(resolveOrbEntryMode({
    ...desktopHome,
    pathname: '/blog',
  }), 'resting');
  assert.equal(resolveOrbEntryMode({
    ...desktopHome,
    viewportWidth: 1023,
  }), 'resting');
  assert.equal(resolveOrbEntryMode({
    ...desktopHome,
    reducedMotion: true,
  }), 'resting');
});

test('未知 hash 不会跳过正常首页开场', () => {
  assert.equal(resolveOrbEntryMode({
    ...desktopHome,
    hash: '#unknown',
  }), 'intro');
});

test('区块意图可以准备并在落位后清除', () => {
  assert.equal(reduceHomeEntryIntent(null, {
    type: 'prepare-section',
    section: 'favorites',
  }), 'favorites');
  assert.equal(reduceHomeEntryIntent('favorites', {
    type: 'clear-section',
  }), null);
});

test('只有普通跨页锚点导航会准备首页区块意图', () => {
  const plainClick = {
    button: 0,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
  };

  assert.equal(getHomeNavigationIntent({
    pathname: '/blog',
    href: '/#about',
    activation: plainClick,
  }), 'about');
  assert.equal(getHomeNavigationIntent({
    pathname: '/',
    href: '/#favorites',
    activation: plainClick,
  }), null);
  assert.equal(getHomeNavigationIntent({
    pathname: '/blog',
    href: '/#favorites',
    activation: { ...plainClick, metaKey: true },
  }), null);
});

test('普通 HOME 导航会请求重新播放首页开场', () => {
  assert.equal(getHomeNavigationIntent({
    pathname: '/blog',
    href: '/',
    activation: {
      button: 0,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
    },
  }), 'intro');
  assert.equal(reduceHomeIntroKey(4), 5);
});
