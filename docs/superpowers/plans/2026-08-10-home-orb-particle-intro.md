# 首页月球粒子开场 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首页大屏首屏实现月球与白色粒子 `lin` 的滚动开场，并清理站内霓虹式 UI 外发光。

**Architecture:** 将粒子采样、确定性漂移和月球路径几何放在纯 TypeScript 模块中，先用 Node 测试锁定；客户端 `OrbScene` 负责 Canvas 绘制和 GSAP ScrollTrigger 编排，`BackgroundEffect` 继续负责静态背景。首页 Hero 只调整 DOM 构图，移动端与减少动画模式直接走右上角归位状态。

**Tech Stack:** Next.js 15、React 19、TypeScript 5.8、Tailwind CSS 4、Canvas 2D、GSAP ScrollTrigger、Node test runner + tsx

## Global Constraints

- 仅在 `/` 且视口宽度至少 `1024px`、未启用 `prefers-reduced-motion` 时初始化粒子滚动动画。
- `lin` 使用冷白 `#F0F0F0` 与灰蓝白 `#CBD6E2`，禁止青色荧光、模糊光晕、拖尾和 screen 混合。
- 月面与粒子同频约 `8s`；遮罩错相约 `12.5s`；外晕呼吸约 `17s`；层间相对位移不超过月球直径约 `1%–2%`。
- 滚动区间为一个视口，不 `pin`、不吸附；动画可逆，刷新或锚点进入时同步真实滚动位置。
- Canvas/字体/GSAP 初始化失败必须降级为当前右上角月球，不阻塞内容和链接。
- 新代码注释使用中文；提交信息使用中文 Conventional Commits；所有文件保持在约 500 行以内。

---

### Task 1: 粒子字形纯函数

**Files:**
- Create: `src/lib/orb-particles.ts`
- Create: `tests/orb-particles.test.ts`

**Interfaces:**
- Produces: `sampleAlphaGrid(alpha, width, height, spacing, alphaThreshold): ParticleOrigin[]`
- Produces: `createWordParticles(origins, seed): WordParticle[]`
- Produces: `particleStateAt(particle, scrollProgress): RenderParticle`

- [ ] **Step 1: 写粒子采样与消散的失败测试**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createWordParticles,
  particleStateAt,
  sampleAlphaGrid,
} from '../src/lib/orb-particles';

test('sampleAlphaGrid 只采样超过阈值且落在间距网格上的像素', () => {
  const alpha = new Uint8ClampedArray([
    255, 0, 255, 0,
    0, 0, 0, 0,
    255, 0, 255, 0,
    0, 0, 0, 0,
  ]);
  assert.deepEqual(sampleAlphaGrid(alpha, 4, 4, 2, 128), [
    { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 2 },
  ]);
});

test('相同 seed 生成完全一致的白色粒子', () => {
  const origins = [{ x: 10, y: 20 }, { x: 30, y: 40 }];
  assert.deepEqual(createWordParticles(origins, 0x4c494e), createWordParticles(origins, 0x4c494e));
  assert.ok(createWordParticles(origins, 0x4c494e).every((p) => ['#F0F0F0', '#CBD6E2'].includes(p.color)));
});

test('粒子在开始时保持字形，结束时局部漂散并透明', () => {
  const particle = createWordParticles([{ x: 10, y: 20 }], 0x4c494e)[0];
  assert.deepEqual(particleStateAt(particle, 0), { x: 10, y: 20, opacity: 1, radius: particle.radius, color: particle.color });
  const end = particleStateAt(particle, 1);
  assert.equal(end.opacity, 0);
  assert.ok(Math.hypot(end.x - 10, end.y - 20) <= 28);
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `pnpm exec tsx --test tests/orb-particles.test.ts`
Expected: FAIL，错误包含 `Cannot find module '../src/lib/orb-particles'`。

- [ ] **Step 3: 实现确定性采样、随机和滚动状态映射**

```ts
export interface ParticleOrigin { x: number; y: number }
export interface WordParticle extends ParticleOrigin {
  driftX: number; driftY: number; delay: number; radius: number;
  color: '#F0F0F0' | '#CBD6E2';
}
export interface RenderParticle { x: number; y: number; opacity: number; radius: number; color: WordParticle['color'] }

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function sampleAlphaGrid(alpha: Uint8ClampedArray, width: number, height: number, spacing: number, alphaThreshold = 96): ParticleOrigin[] {
  const origins: ParticleOrigin[] = [];
  for (let y = 0; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      if (alpha[y * width + x] >= alphaThreshold) origins.push({ x, y });
    }
  }
  return origins;
}
```

补全 `mulberry32(seed)`；漂移角度均匀分布、距离限制为 `8–28px`、delay 为 `0–0.18`。`particleStateAt` 将 `(progress - 0.08) / 0.82` 映射为局部进度并应用 smoothstep，不加入逐帧随机抖动。

- [ ] **Step 4: 运行定向与全量测试**

Run: `pnpm exec tsx --test tests/orb-particles.test.ts && pnpm test`
Expected: 新增 3 项测试和原有 6 项测试全部 PASS。

- [ ] **Step 5: 提交粒子模型**

```bash
git add src/lib/orb-particles.ts tests/orb-particles.test.ts
git commit -m "feat(home): 增加白色文字粒子模型"
```

### Task 2: 月球路径与降级判定

**Files:**
- Create: `src/lib/orb-motion.ts`
- Create: `tests/orb-motion.test.ts`

**Interfaces:**
- Produces: `shouldAnimateOrb({ pathname, viewportWidth, reducedMotion }): boolean`
- Produces: `getOrbMotionGeometry(viewportWidth, viewportHeight): OrbMotionGeometry`

- [ ] **Step 1: 写响应式模式和路径几何的失败测试**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { getOrbMotionGeometry, shouldAnimateOrb } from '../src/lib/orb-motion';

test('只在首页大屏且未减少动画时启用开场', () => {
  assert.equal(shouldAnimateOrb({ pathname: '/', viewportWidth: 1440, reducedMotion: false }), true);
  assert.equal(shouldAnimateOrb({ pathname: '/blog', viewportWidth: 1440, reducedMotion: false }), false);
  assert.equal(shouldAnimateOrb({ pathname: '/', viewportWidth: 1023, reducedMotion: false }), false);
  assert.equal(shouldAnimateOrb({ pathname: '/', viewportWidth: 1440, reducedMotion: true }), false);
});

test('终点与现有 top/right/size 月球构图一致', () => {
  const geometry = getOrbMotionGeometry(1440, 900);
  assert.equal(geometry.targetSize, 630);
  assert.equal(geometry.targetTop, -162);
  assert.equal(geometry.targetLeft, 972);
  assert.ok(Math.abs(geometry.startCenterX - 835.2) < 0.001);
  assert.equal(geometry.startCenterY, 405);
});
```

- [ ] **Step 2: 运行测试并确认缺少模块**

Run: `pnpm exec tsx --test tests/orb-motion.test.ts`
Expected: FAIL，错误包含 `Cannot find module '../src/lib/orb-motion'`。

- [ ] **Step 3: 实现模式判定与像素几何**

`targetSize = viewportHeight * 0.7`、`targetTop = viewportHeight * -0.18`、`targetLeft = viewportWidth - viewportHeight * 0.52`；起点中心固定为 `58vw / 45vh`，起点尺寸为 `min(58vh, 52vw)`，返回起止左上角、尺寸和 scale。

- [ ] **Step 4: 运行定向与全量测试**

Run: `pnpm exec tsx --test tests/orb-motion.test.ts && pnpm test`
Expected: 新增 2 项测试与全部既有测试 PASS。

- [ ] **Step 5: 提交路径逻辑**

```bash
git add src/lib/orb-motion.ts tests/orb-motion.test.ts
git commit -m "feat(home): 定义月球滚动路径与降级规则"
```

### Task 3: Canvas 月球场景与 GSAP 编排

**Files:**
- Create: `src/components/ui/OrbScene.tsx`
- Modify: `src/components/ui/BackgroundEffect.tsx`
- Modify: `src/app/globals.css`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `tests/orb-scene-contract.test.ts`

**Interfaces:**
- Consumes: `sampleAlphaGrid`、`createWordParticles`、`particleStateAt`、`shouldAnimateOrb`、`getOrbMotionGeometry`
- Produces: `OrbScene` 客户端组件；`BackgroundEffect` 全局只保留一个月球实例

- [ ] **Step 1: 写场景结构失败测试**

```ts
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

test('OrbScene 提供无障碍粒子画布且不使用荧光样式', () => {
  const path = new URL('../src/components/ui/OrbScene.tsx', import.meta.url);
  assert.equal(existsSync(path), true);
  const source = readFileSync(path, 'utf8');
  assert.match(source, /aria-hidden="true"/);
  assert.match(source, /pointer-events-none/);
  assert.doesNotMatch(source, /text-shadow|drop-shadow|mix-blend-screen|#51EEFC/i);
});

test('BackgroundEffect 只挂载 OrbScene，不保留旧月球节点', () => {
  const source = readFileSync(new URL('../src/components/ui/BackgroundEffect.tsx', import.meta.url), 'utf8');
  assert.match(source, /<OrbScene\s*\/?>/);
  assert.doesNotMatch(source, /p3r-moon-bloom/);
});
```

- [ ] **Step 2: 运行测试并确认结构尚不存在**

Run: `pnpm exec tsx --test tests/orb-scene-contract.test.ts`
Expected: FAIL 于 `existsSync(path) === true` 或 `<OrbScene />` 断言。

- [ ] **Step 3: 安装 GSAP**

Run: `pnpm add gsap`
Expected: `package.json` 与 `pnpm-lock.yaml` 新增 `gsap`，不引入 Three.js 或 tsParticles。

- [ ] **Step 4: 实现 OrbScene 与 Canvas 字形采样**

`OrbScene` 使用 `usePathname()`、`matchMedia('(prefers-reduced-motion: reduce)')` 和窗口宽度决定模式。启用时等待 `document.fonts.ready`，在离屏 Canvas 用 `900 <size>px Anton` 绘制小写 `lin`，把 alpha 通道传给粒子模块；可见 Canvas DPR 上限为 2。初始化失败时设置终点样式并跳过动画。

- [ ] **Step 5: 使用 ScrollTrigger 同步一个视口滚动**

动态导入 `gsap` 与 `gsap/ScrollTrigger`，注册插件后创建无 pin 时间线：`start: 0`、`end: () => window.innerHeight`、`scrub: 0.35`、`invalidateOnRefresh: true`。月球外层从纯函数返回的起点 `x/y/scale` 到终点 `x/y/scale`；`onUpdate` 用真实 progress 重绘 Canvas，反向滚动复用同一映射。cleanup 负责 kill timeline、移除 media/resize 监听并取消待处理动画帧。

- [ ] **Step 6: 拆分月面、遮罩、外晕的错相 CSS**

在 `globals.css` 定义 `p3r-orb-core-drift`（8s）、`p3r-orb-mask-drift`（12.5s）、`p3r-orb-bloom-breathe`（17s）三组 keyframes；粒子 Canvas 与月面应用相同 core 动画。相对位移限制在约 8px，`prefers-reduced-motion` 下全部停止。

- [ ] **Step 7: 运行场景测试、类型检查和构建**

Run: `pnpm exec tsx --test tests/orb-scene-contract.test.ts && pnpm typecheck && pnpm build`
Expected: 场景合同测试 PASS、TypeScript 0 错误、Next 静态导出成功。

- [ ] **Step 8: 提交场景实现**

```bash
git add package.json pnpm-lock.yaml src/components/ui/OrbScene.tsx src/components/ui/BackgroundEffect.tsx src/app/globals.css tests/orb-scene-contract.test.ts
git commit -m "feat(home): 实现月球粒子滚动开场"
```

### Task 4: Hero 错层布局与站内去荧光

**Files:**
- Modify: `src/components/home/HeroSection.tsx`
- Modify: `src/components/home/AboutSection.tsx`
- Modify: `src/components/ArticleView.tsx`
- Modify: `src/app/blog/BlogListClient.tsx`
- Create: `tests/ui-style-contracts.test.ts`

**Interfaces:**
- Produces: 带 `data-home-orb-trigger` 的一视口 Hero；无霓虹外发光的卡片和状态装饰

- [ ] **Step 1: 写布局与去荧光失败测试**

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Hero 提供滚动触发区且精选卡片没有模糊外发光', () => {
  const hero = source('src/components/home/HeroSection.tsx');
  assert.match(hero, /data-home-orb-trigger/);
  assert.match(hero, /min-h-\[calc\(100svh-5rem\)\]/);
  assert.doesNotMatch(hero, /blur-lg|bg-p3cyan\/30/);
});

test('状态装饰不再使用 0 0 发光阴影', () => {
  for (const path of [
    'src/components/home/AboutSection.tsx',
    'src/components/ArticleView.tsx',
    'src/app/blog/BlogListClient.tsx',
  ]) assert.doesNotMatch(source(path), /shadow-\[0_0_/);
});
```

- [ ] **Step 2: 运行测试并确认新合同尚未满足**

Run: `pnpm exec tsx --test tests/ui-style-contracts.test.ts`
Expected: FAIL 于 Hero trigger/min-height 或现有 glow class 断言。

- [ ] **Step 3: 重排桌面 Hero，保留小屏现有阅读布局**

大屏 section 使用 `lg:min-h-[calc(100svh-5rem)]` 与相对定位；简介卡片定位左侧中段，精选卡片定位右下并跨压月球边缘。小于 `lg` 保持单列正常流。移除 hover 模糊层，链接只保留 `group-hover:border-white/45`、最多 `-translate-y-1` 和已有硬边面板阴影。

- [ ] **Step 4: 清理同类 UI 光晕**

移除 About 白点/技能条、ArticleView 红色菱形、BlogList 加载菱形的 `shadow-[0_0_*]`；用平面颜色、边框或 `shadow-[2px_2px_0_*]` 替代。不要改动月球 bloom、水波纹环境亮度、Logo 黑色投影和按钮硬边偏移阴影。

- [ ] **Step 5: 运行定向和全量检查**

Run: `pnpm exec tsx --test tests/ui-style-contracts.test.ts && pnpm lint && pnpm typecheck && pnpm test`
Expected: 样式合同、lint、类型检查和全部测试 PASS，ESLint 无 error。

- [ ] **Step 6: 提交布局与视觉清理**

```bash
git add src/components/home/HeroSection.tsx src/components/home/AboutSection.tsx src/components/ArticleView.tsx src/app/blog/BlogListClient.tsx tests/ui-style-contracts.test.ts
git commit -m "style(blog): 调整首页层叠构图并移除霓虹光晕"
```

### Task 5: 视觉验证与收尾

**Files:**
- Modify only if verification reveals a concrete defect: files from Tasks 1–4

**Interfaces:**
- Consumes: 完整首页场景与降级状态
- Produces: 桌面首屏/中途/结束态和移动端的验证证据

- [ ] **Step 1: 运行完整质量门禁**

Run: `pnpm check`
Expected: lint、typecheck、全部测试、Next build 与 postbuild feed 全部 exit 0。

- [ ] **Step 2: 启动一次静态导出预览并检查控制台**

Run: `python3 -m http.server 4173 -d out`
Expected: `http://localhost:4173/` 可访问，首页加载无 React hydration、Canvas、字体或 GSAP 错误；检查完成后终止该进程。

- [ ] **Step 3: 桌面视觉回归**

使用 1440×900 视口记录滚动 0%、30%、70%、100% 截图：月球由中部略偏右归位右上角，`lin` 始终在月心附近且逐步消失，月面/遮罩/外晕错相浮动，Featured hover 无青色模糊外圈。

- [ ] **Step 4: 小屏和减少动画验证**

使用 390×844 视口确认没有粒子 Canvas、月球直接位于右上角且 Hero 为单列；模拟 `prefers-reduced-motion: reduce` 后重复桌面检查，确认无滚动场景和内部浮动。

- [ ] **Step 5: 检查提交与工作区**

Run: `git diff --check && git status --short && git log --oneline --decorate -6`
Expected: 无未提交改动；提交历史包含设计、粒子模型、路径逻辑、场景实现和视觉清理的小提交。
