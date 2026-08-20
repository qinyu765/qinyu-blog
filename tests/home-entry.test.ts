import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getHomeNavigationIntent,
  reduceHomeEntryIntent,
  reduceHomeIntroRequest,
  resolveOrbEntryMode,
  shouldClearHomeAnchor,
} from '../src/lib/home-entry';

const desktopHome = {
  pathname: '/',
  pendingHomeSection: null,
  hash: '',
  viewportWidth: 1440,
  reducedMotion: false,
  homeIntroRequest: { key: 0, mode: 'fresh' },
  consumedHomeIntroKey: 0,
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
    homeIntroRequest: { key: 1, mode: 'returning' },
  }), 'resting');
  assert.equal(resolveOrbEntryMode({
    ...desktopHome,
    reducedMotion: true,
    homeIntroRequest: { key: 1, mode: 'returning' },
  }), 'resting');
});

test('未知 hash 不会跳过正常首页开场', () => {
  assert.equal(resolveOrbEntryMode({
    ...desktopHome,
    hash: '#unknown',
  }), 'intro');
});

test('非首页返回首页会进入 returning 模式，消费后不会重复返回', () => {
  assert.equal(resolveOrbEntryMode({
    ...desktopHome,
    homeIntroRequest: { key: 1, mode: 'returning' },
  }), 'returning');
  assert.equal(resolveOrbEntryMode({
    ...desktopHome,
    homeIntroRequest: { key: 1, mode: 'returning' },
    consumedHomeIntroKey: 1,
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
  assert.equal(getHomeNavigationIntent({
    pathname: '/blog',
    href: '/',
    activation: { ...plainClick, ctrlKey: true },
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
  }), 'returning');
  assert.equal(getHomeNavigationIntent({
    pathname: '/',
    href: '/',
    activation: {
      button: 0,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
    },
  }), 'fresh');
  assert.deepEqual(reduceHomeIntroRequest({ key: 4, mode: 'fresh' }, 'returning'), {
    key: 5,
    mode: 'returning',
  });
});

test('跨页锚点落位后清理临时 hash，直接打开 hash 则保留', () => {
  assert.equal(shouldClearHomeAnchor('favorites', '#favorites'), true);
  assert.equal(shouldClearHomeAnchor('about', '#about'), true);
  assert.equal(shouldClearHomeAnchor(null, '#favorites'), false);
  assert.equal(shouldClearHomeAnchor('favorites', '#about'), false);
});
