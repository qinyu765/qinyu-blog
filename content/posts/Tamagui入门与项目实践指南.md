---
title: "Tamagui 入门与项目实践指南"
date: "2026.03.07"
category: "TECH"
excerpt: "全面介绍现代化跨平台 UI 框架 Tamagui：探究如何利用其静态编译器与设计令牌打造高性能的全端设计系统。"
---
# Tamagui 入门与项目实践指南

## 目录

1. [什么是 Tamagui](#1-什么是-tamagui)
2. [核心概念](#2-核心概念)
3. [项目配置详解](#3-项目配置详解)
4. [Tokens（设计令牌）](#4-tokens设计令牌)
5. [项目主题颜色详解](#5-项目主题颜色详解)
6. [Shorthands（简写属性）](#6-shorthands简写属性)
7. [在第三方组件中使用 Token](#7-在第三方组件中使用-token)
8. [布局组件](#8-布局组件)
9. [项目实战示例](#9-项目实战示例)
10. [性能优化](#10-性能优化)
11. [学习资源](#11-学习资源)

---

## 1. 什么是 Tamagui

Tamagui 是一个现代化的 **跨平台 UI 框架**，专为 React Native 和 React Web 设计。它的核心优势在于：

- **一次编写，多端运行**：同一套代码可以在 Web、iOS、Android 上运行
- **优化编译器**：在构建时将样式提取为原子 CSS，显著提升运行时性能
- **类型安全**：完整的 TypeScript 支持，提供智能提示
- **设计系统**：内置 Tokens、Themes、Variants 等设计系统概念

### 与其他方案对比

| 特性 | Tamagui | StyleSheet (RN) | Styled Components |
|------|---------|-----------------|-------------------|
| 跨平台 | ✅ Web + Native | ❌ 仅 Native | ⚠️ 需适配 |
| 编译优化 | ✅ 静态提取 | ❌ | ❌ |
| 设计令牌 | ✅ 内置 | ❌ | ⚠️ 需自建 |
| 简写语法 | ✅ `w`, `h`, `bg` | ❌ | ❌ |

---

## 2. 核心概念

### 2.1 Tokens（设计令牌）

Tokens 是可复用的设计值，类似 CSS 变量。在 Tamagui 中通过 `$` 前缀引用：

```tsx
// $full 是一个 size token，值为 '100%'
<YTImage width={'$full'} />

// $background 是一个 theme token
<YTXStack bg={'$background'} />

// $gray2 是一个颜色 token
<YTXStack bg={'$gray2'} />
```

### 2.2 Shorthands（简写属性）

Tamagui 提供简写属性，减少代码量：

```tsx
// 简写形式
<YTXStack w={100} h={44} px={16} bg="$slBlue9" ai="center" jc="center" />

// 等价于完整写法
<YTXStack
  width={100}
  height={44}
  paddingHorizontal={16}
  backgroundColor="$slBlue9"
  alignItems="center"
  justifyContent="center"
/>
```

### 2.3 Themes（主题）

主题是可切换的设计值集合，支持嵌套：

```tsx
<Theme name="light">
  <YTText>浅色文字</YTText>
  <Theme name="dark">
    <YTText>深色文字</YTText>
  </Theme>
</Theme>
```

---

## 3. 项目配置详解

### 3.1 配置文件位置

在 BookLN 项目中，Tamagui 配置位于：
- `apps/bookln-rn/tamagui.config.ts`
- `apps/bookln-web/tamagui.config.ts`

### 3.2 配置结构分析

```typescript
// apps/bookln-rn/tamagui.config.ts
import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';
import { booklnThemes } from '@bookln/theme';

export const config = createTamagui({
  // 继承默认配置
  ...defaultConfig,

  // 自定义主题（包含所有颜色 token）
  themes: booklnThemes,

  // 设置项
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,  // 允许完整属性名和简写同时使用
    styleCompat: 'react-native', // 样式兼容 React Native
  },

  // 自定义简写
  shorthands: {
    ...defaultConfig.shorthands,
    f: 'flex',
    ai: 'alignItems',
    bg: 'backgroundColor',
    jc: 'justifyContent',
    w: 'width',
    h: 'height',
    br: 'borderRadius',
    // ... 更多简写
  } as const,

  // 自定义 tokens
  tokens: {
    ...defaultConfig.tokens,
    size: {
      ...defaultConfig.tokens.size,
      full: '100%',  // 自定义 $full token
    },
  },
});

// TypeScript 类型声明（重要！）
export type Conf = typeof config;
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
```

---

## 4. Tokens（设计令牌）

### 4.1 Token 类型

Tamagui 支持多种类型的 tokens：

| Token 类型 | 用途 | 示例 |
|-----------|------|------|
| `size` | 尺寸值 | `$1`, `$2`, `$full` |
| `space` | 间距值 | `$sm`, `$md`, `$lg` |
| `radius` | 圆角值 | `$2`, `$4`, `$full` |
| `color` | 颜色值 | `$red10`, `$blue5` |
| `zIndex` | 层级值 | `$1`, `$2`, `$modal` |

### 4.2 Token 引用语法

在属性中使用 `$` 前缀引用 token：

```tsx
// 项目中的实际使用
<YTImage
  width={'$full'}      // 引用 size.full = '100%'
  aspectRatio={1}
  br={4}               // borderRadius: 4
/>

// 颜色 token
<YTXStack bg={'$gray2'} />      // 灰色背景
<YTText color={'$slBlue9'} />   // 主题蓝色文字
```

### 4.3 Token 值的计算

**重要理解**：`$full` 等 token 的实际值取决于父容器！

```tsx
// 布局层级
YTGridView (屏幕宽度 375px, padding 8px, gap 8px, 2列)
  └─ YTXStack (width='$full' → 约 175px)
       └─ YTImage (width='$full' → 约 159px)
```

`$full` = `100%` 是**相对于父容器**的，而非屏幕宽度。

---

## 5. 项目主题颜色详解

### 5.1 颜色 Token 来源

项目颜色定义在 `packages/theme/src/colors.ts` 和 `packages/theme/src/booklnThemes.ts`。

### 5.2 Tamagui 内置颜色（来自 @tamagui/colors）

**灰度色阶 `$gray1` - `$gray12`**：

| Token | 浅色模式 | 用途 |
|-------|---------|------|
| `$gray1` | 最浅 | 页面背景 |
| `$gray2` | 很浅 | 卡片背景 |
| `$gray3` | 浅 | 悬停状态 |
| `$gray4` | 较浅 | 按下状态 |
| `$gray5` | 中浅 | 分割线 |
| `$gray6` | 中 | 边框 |
| `$gray7` | 较深 | 次要边框 |
| `$gray8` | 深 | 占位符文字 |
| `$gray9` | 很深 | 次要文字 |
| `$gray10` | 更深 | 主要文字 |
| `$gray11` | 非常深 | 高对比度文字 |
| `$gray12` | 最深 | 标题文字 |

**其他内置色系**（同样 1-12 色阶）：
- `$red1` - `$red12`：红色系
- `$blue1` - `$blue12`：蓝色系
- `$green1` - `$green12`：绿色系
- `$yellow1` - `$yellow12`：黄色系
- `$orange1` - `$orange12`：橙色系
- `$purple1` - `$purple12`：紫色系
- `$pink1` - `$pink12`：粉色系

### 5.3 项目自定义颜色（sl 系列）

**主题蓝 `$slBlue1` - `$slBlue12`**：

```typescript
// packages/theme/src/colors.ts
export const slBlue = {
  slBlue1: 'rgb(252, 253, 255)',  // #fcfdff - 最浅背景
  slBlue2: 'rgb(246, 249, 255)',  // #f6f9ff
  slBlue3: 'rgb(236, 242, 255)',  // #ecf2ff
  slBlue4: 'rgb(223, 234, 255)',  // #dfeaff - 浅色按钮背景
  slBlue5: 'rgb(207, 223, 255)',  // #cfdfff
  slBlue6: 'rgb(189, 209, 255)',  // #bdd1ff
  slBlue7: 'rgb(166, 191, 254)',  // #a6bffe
  slBlue8: 'rgb(134, 165, 248)',  // #86a5f8 - 边框色
  slBlue9: 'rgb(78, 118, 255)',   // #4e76ff - ⭐ 主色调
  slBlue10: 'rgb(68, 105, 237)',  // #4469ed - hover 状态
  slBlue11: 'rgb(61, 96, 225)',   // #3d60e1 - pressed 状态
  slBlue12: 'rgb(28, 46, 102)',   // #1c2e66 - 深色文字
};
```

**使用示例**：

```tsx
// 主要按钮
<YTXStack bg={'$slBlue9'} />

// 浅色背景
<YTXStack bg={'$slBlue4'} />

// 边框
<YTXStack boc={'$slBlue8'} bw={1} />
```

**其他 sl 系列**：
- `$slPink1` - `$slPink12`：粉色系
- `$slPurple1` - `$slPurple12`：紫色系
- `$slGreen1` - `$slGreen12`：绿色系
- `$slRed1` - `$slRed12`：红色系

### 5.4 BookLN 设计系统颜色

```typescript
// packages/theme/src/colors.ts
export const booklnColors = {
  // 文字颜色
  common_level1_base: '#111F2C',              // 主要文字
  common_level2_base: 'rgba(17, 31, 44, 0.56)', // 次要文字
  common_level3_base: 'rgba(17, 31, 44, 0.40)', // 描述文字
  common_level4_base: 'rgba(17, 31, 44, 0.28)', // 禁用/占位符

  // 背景颜色
  common_bg1: '#F6F7FF',      // 页面背景
  common_bg2: '#FFFFFF',      // 卡片背景

  // 主题色
  common_primary1: '#7847FF', // 主紫色
  common_blue1: '#2C64FF',    // 链接蓝
  common_orange1: '#FF6F00',  // 警告橙
  common_red1: '#FF4500',     // 错误红
  common_green1: '#00B042',   // 成功绿
};
```

**使用示例**：

```tsx
// 主要文字
<YTText color={'$common_level1_base'}>标题</YTText>

// 次要文字
<YTText color={'$common_level2_base'}>副标题</YTText>

// 页面背景
<YTYStack bg={'$common_bg1'} />
```

### 5.5 颜色色阶规律

Tamagui 颜色遵循 **1-12 色阶**规律：

| 色阶 | 用途 | 示例 |
|------|------|------|
| 1-2 | 背景色 | `$slBlue1` 页面背景 |
| 3-4 | 交互背景 | `$slBlue4` 按钮浅色背景 |
| 5-6 | 边框/分割线 | `$slBlue6` 边框 |
| 7-8 | 次要元素 | `$slBlue8` 边框强调 |
| **9** | **主色调** | `$slBlue9` 主按钮 |
| 10 | hover 状态 | `$slBlue10` |
| 11 | pressed 状态 | `$slBlue11` |
| 12 | 文字色 | `$slBlue12` 深色文字 |

---

## 6. Shorthands（简写属性）

### 6.1 项目中定义的简写

```typescript
shorthands: {
  f: 'flex',              // f={1}
  ai: 'alignItems',       // ai="center"
  bg: 'backgroundColor',  // bg="#FFFFFF" 或 bg="$slBlue9"
  jc: 'justifyContent',   // jc="space-between"
  w: 'width',             // w={100} 或 w="$full"
  h: 'height',            // h={44}
  br: 'borderRadius',     // br={8}
  dsp: 'display',         // dsp="flex"
  fd: 'flexDirection',    // fd="row"
  fw: 'flexWrap',         // fw="wrap"
  bw: 'borderWidth',      // bw={1}
  boc: 'borderColor',     // boc="$slBlue8"
  ta: 'textAlign',        // ta="center"
}
```

### 6.2 默认配置中的常用简写

```typescript
// 内边距
p: 'padding'
px: 'paddingHorizontal'
py: 'paddingVertical'
pt/pb/pl/pr: 上/下/左/右内边距

// 外边距
m: 'margin'
mx: 'marginHorizontal'
my: 'marginVertical'
mt/mb/ml/mr: 上/下/左/右外边距

// 定位
pos: 'position'
t/b/l/r: top/bottom/left/right
```

---

## 7. 在第三方组件中使用 Token

### 7.1 问题场景

Token（如 `$slBlue9`）只能在 Tamagui 组件的 props 中直接使用。对于第三方组件（如 `react-native-reanimated`、`lucide-react-native` 等），需要先获取 token 的实际值。

```tsx
// ❌ 错误：第三方组件不识别 $ token
<LoaderCircle color="$slBlue9" />

// ✅ 正确：需要获取实际颜色值
<LoaderCircle color="#4e76ff" />
```

### 7.2 使用 useTheme Hook

Tamagui 提供 `useTheme` hook 来获取主题 token 的实际值：

```tsx
import { useTheme } from 'tamagui';

const MyComponent = () => {
  const theme = useTheme();

  // 获取 token 的实际值
  const blueColor = theme['$slBlue9']?.val;  // '#4e76ff'
  const grayColor = theme['$gray12']?.val;   // 实际颜色值

  return (
    // 用于第三方组件
    <LoaderCircle color={blueColor} />
  );
};
```

### 7.3 实际项目示例（YTButton 组件）

来自 `packages/cross-platform-components/src/components/YTButton/YTButton.tsx`：

```tsx
import { useTheme } from 'tamagui';
import { LoaderCircle } from 'lucide-react-native';

export const YTButton = ({ themeColor = 'slBlue', type = 'primary' }) => {
  const theme = useTheme();

  // 根据按钮类型动态获取颜色
  const iconProps = useMemo(() => {
    switch (type) {
      case 'primary':
        return { color: 'white' };

      case 'secondary': {
        const tempThemeColor = themeColor ?? 'gray';
        // 动态构建 token 名并获取值
        const tokenName = `$${tempThemeColor}${tempThemeColor === 'gray' ? '12' : '9'}`;
        return {
          color: theme[tokenName]?.val,  // 获取实际颜色值
        };
      }

      case 'outline': {
        const tempThemeColor = themeColor ?? 'slBlue';
        return {
          color: theme[`$${tempThemeColor}9`]?.val,
        };
      }
    }
  }, [theme, themeColor, type]);

  return (
    <TamaguiButton>
      {/* LoaderCircle 是第三方组件，需要实际颜色值 */}
      <LoaderCircle {...iconProps} />
    </TamaguiButton>
  );
};
```

### 7.4 动态 Token 引用

可以使用模板字符串动态构建 token 名：

```tsx
const theme = useTheme();
const themeColor = 'slBlue';

// 动态构建 token 名
const bgToken = `$${themeColor}9`;        // '$slBlue9'
const hoverToken = `$${themeColor}10`;    // '$slBlue10'
const pressedToken = `$${themeColor}11`;  // '$slBlue11'

// 在 Tamagui 组件中直接使用（字符串形式）
<YTXStack bg={bgToken} />

// 在第三方组件中使用（需要 .val）
<ThirdPartyComponent color={theme[bgToken]?.val} />
```

### 7.5 useTheme 返回值结构

```typescript
const theme = useTheme();

// theme 对象结构
{
  '$slBlue9': {
    val: '#4e76ff',        // 实际颜色值
    variable: '--slBlue9', // CSS 变量名（Web）
  },
  '$gray12': {
    val: '#1a1a1a',
    variable: '--gray12',
  },
  // ... 所有主题 token
}
```

### 7.6 常见使用场景

```tsx
import { useTheme } from 'tamagui';

const MyComponent = () => {
  const theme = useTheme();

  // 场景1：React Native Animated
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: theme['$slBlue9']?.val,
  }));

  // 场景2：SVG 图标
  return <MySvgIcon fill={theme['$common_primary1']?.val} />;

  // 场景3：第三方图表库
  return <Chart color={theme['$slGreen9']?.val} />;

  // 场景4：样式对象
  const styles = StyleSheet.create({
    container: {
      borderColor: theme['$gray6']?.val,
    },
  });
};
```

---

## 8. 布局组件

### 8.1 YTXStack（水平布局）

基于 Tamagui 的 `XStack`，默认 `flexDirection: 'row'`：

```tsx
<YTXStack gap={8} ai="center" jc="space-between">
  <YTImage source={icon} w={24} h={24} />
  <YTText>标题</YTText>
  <YTButton>操作</YTButton>
</YTXStack>
```

### 8.2 YTYStack（垂直布局）

基于 Tamagui 的 `YStack`，默认 `flexDirection: 'column'`：

```tsx
<YTYStack gap={4} bg={'$common_bg2'}>
  <YTImage width={'$full'} aspectRatio={1} />
  <YTText fontSize={14}>商品名称</YTText>
  <YTText fontSize={12} color={'$common_level2_base'}>描述</YTText>
</YTYStack>
```

### 8.3 Stack vs View

| 组件 | 默认样式 | 用途 |
|------|---------|------|
| `XStack` | `flexDirection: 'row'` | 水平排列子元素 |
| `YStack` | `flexDirection: 'column'` | 垂直排列子元素 |
| `Stack` | 无默认方向 | 需要手动指定方向 |
| `View` | 无 | 基础容器，无 Tamagui 优化 |

---

## 9. 项目实战示例

### 9.1 商品卡片组件

```tsx
<YTYStack gap={4} bg={'$common_bg2'}>
  {/* 商品图片 */}
  <YTImage
    source={{ uri: item.thumbnails }}
    br={4}
    width={'$full'}
    aspectRatio={1}
    ossWidth={200}
  />

  {/* 商品名称 */}
  <YTText fontSize={14} color={'$common_level1_base'} numberOfLines={1}>
    {item.goodName}
  </YTText>

  {/* 价格和操作 */}
  <YTXStack jc="space-between" ai="center">
    <YTText fontSize={14} color={'$slPink9'}>{item.pricing}</YTText>
    <YTXStack bg={'$slBlue4'} px={6} py={2} br={6}>
      <YTText fontSize={12} color={'$slBlue9'}>立即兑换</YTText>
    </YTXStack>
  </YTXStack>
</YTYStack>
```

### 9.2 按钮样式动态计算

```tsx
const typeProps = useMemo(() => {
  const color = themeColor ?? 'slBlue';

  return {
    bg: `$${color}9`,           // 主背景色
    pressStyle: {
      bg: `$${color}11`,        // 按下状态
    },
    hoverStyle: {
      bg: `$${color}10`,        // 悬停状态
    },
  };
}, [themeColor]);
```

---

## 10. 性能优化

### 10.1 样式优先级（项目规范）

1. **Tamagui Props**（最优先）
   ```tsx
   <YTXStack w={100} h={44} px={16} bg="$slBlue9" />
   ```

2. **StyleSheet.create()**（其次）
   ```tsx
   const styles = StyleSheet.create({ container: { ... } });
   ```

3. **内联 style**（禁止使用）
   ```tsx
   // ❌ 禁止
   <YTXStack style={{ width: 100 }} />
   ```

### 10.2 最佳实践

```tsx
// ✅ 使用 memo 包装组件
export const YTXStack = memo((props) => { ... });

// ✅ 使用 useMemo 缓存样式计算
const typeProps = useMemo(() => ({ ... }), [deps]);

// ✅ 使用 token 而非硬编码颜色
<YTXStack bg="$slBlue9" />  // 而非 bg="#4e76ff"
```

---

## 11. 学习资源

### 官方资源

- [Tamagui 官方文档](https://tamagui.dev/) - 最权威的参考资料
- [Tamagui UI 组件库](https://tamagui.dev/ui/intro) - 官方 UI 组件文档
- [GitHub 仓库](https://github.com/tamagui/tamagui) - 源码和 Issues

### 教程文章

- [Getting Started with Tamagui - DEV Community](https://dev.to/cathylai/getting-started-with-tamagui-a-complete-guide-to-modern-react-native-styling-3fff)
- [React Native Expo with Tamagui Integration](https://mobisoftinfotech.com/resources/blog/react-native-expo-tamagui-integration-guide)
- [Tamagui for React Native - LogRocket](https://blog.logrocket.com/tamagui-react-native-create-faster-design-systems/)
- [How to Integrate Tamagui with React Native Expo - Medium](https://medium.com/@manthankaslemk/how-to-integrate-tamagui-with-react-native-expo-step-by-step-guide-ce6e70931472)

### 项目内参考

- `apps/bookln-rn/tamagui.config.ts` - 项目配置
- `packages/theme/src/colors.ts` - 颜色定义
- `packages/theme/src/booklnThemes.ts` - 主题配置
- `packages/cross-platform-components/` - YT 系列组件实现

---

## 快速参考

### 常用颜色 Token

| Token | 用途 | 颜色值 |
|-------|------|--------|
| `$slBlue9` | 主题蓝 | #4e76ff |
| `$slBlue4` | 浅蓝背景 | #dfeaff |
| `$gray12` | 主要文字 | 深灰 |
| `$gray2` | 卡片背景 | 浅灰 |
| `$common_primary1` | 主紫色 | #7847FF |
| `$common_level1_base` | 标题文字 | #111F2C |

### 常用简写

| 简写 | 完整属性 |
|------|---------|
| `w` | width |
| `h` | height |
| `bg` | backgroundColor |
| `br` | borderRadius |
| `ai` | alignItems |
| `jc` | justifyContent |
| `px` | paddingHorizontal |
| `py` | paddingVertical |
| `bw` | borderWidth |
| `boc` | borderColor |

### useTheme 快速用法

```tsx
import { useTheme } from 'tamagui';

const theme = useTheme();
const color = theme['$slBlue9']?.val;  // '#4e76ff'
```
