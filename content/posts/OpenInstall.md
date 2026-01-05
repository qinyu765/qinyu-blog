---
title: "WANDERING"
date: "2025.06.45"
category: "LIFE"
coverImage: "https://picsum.photos/800/405"
excerpt: "Personal reflections on productivity, burnout, and finding balance in the digital age."
---

* 使用 **异步加载 Web SDK**
* 通过 **Promise 封装 script 加载**
* `.then()` 链式调用后续业务
* **所有逻辑封装在一个函数中**
* 在 `useDownload.ts` 中调用
* **固定写入 openInstallAppKey 到运行数据中**

我们先了解**知识体系**，再看**工程化实现示例**。

---

# 一、OpenInstall 知识点总览（笔记版）

## 1. OpenInstall 是什么

**OpenInstall 是一个 App 安装归因与传参平台**，核心能力是：

* Web → App 的 **参数透传**
* App 安装来源的 **渠道归因**
* Web 页面 **拉起 App / 引导安装**

它是一个 **跨端系统**，由三部分组成：

| 组成          | 作用            |
| ----------- | ------------- |
| Web SDK     | 参数采集、唤起 / 安装  |
| Android SDK | 安装后获取 Web 端参数 |
| iOS SDK     | 同上            |

---

## 2. Web SDK 的本质

OpenInstall Web SDK = 一个通过 `<script>` 注入的全局构造函数 + 一套安装/唤起能力

### 2.1 Web SDK 的加载方式（web 集成）

Web SDK 内部会使用：
- window.location
- document
- navigator.userAgent
- 定时器 / visibility API
这些都不适合做成纯模块化库。

OpenInstall Web SDK **不是 npm 包，也不是 ES Module**，而是：

```html
<script src="https://res.openinstall.com/openinstall-{AppKey}.js"></script>
```

加载后在浏览器中挂载：

```ts
window.OpenInstall
```

---

### 2.2 Web SDK 提供的能力

#### 静态能力

```ts
OpenInstall.parseUrlParams()
```

* 从 `location.search` 中解析参数
* 用于安装传参、渠道识别

---

#### 实例能力（new 之后）

```ts
const oi = new OpenInstall(config, data);
```

实例主要提供：

| 方法              | 作用          |
| --------------- | ----------- |
| schemeWakeup    | 尝试唤起已安装 App |
| wakeupOrInstall | 唤起失败则引导安装   |

---

## 3. Web 集成的完整链路

```text
用户访问 Web 页面
    ↓
Web SDK 解析 URL 参数
    ↓
参数上报 OpenInstall 服务端
    ↓
用户点击下载
    ↓
唤起 App 或跳转安装
    ↓
App 首次启动
    ↓
移动端 SDK 获取参数
```

---

# 二、为什么要用 Promise 异步加载 SDK

### 1. 技术原因

* Web SDK 是 **外部 script**
* 加载是 **异步的**
* React 组件渲染时 **不保证已加载完成**

---

### 2. 工程目标

* **确保 SDK 可用后再执行业务**
* 避免 `window.OpenInstall is undefined`
* 支持 `.then()` 链式调用

---

# 三、工程化实现方案

## 1. 运行时数据定义（固定 AppKey）
在配置信息中加入AppKey

```ts
// D:\For coding\YunTi\app-download-page\apps\bookAIDownload\src\config\downloadConfig.ts
import { container } from '@common/container/container';
import type { DownloadParams } from '@yunti-private/app-download-wrapper';

export const downloadConfig = (): DownloadParams => {
  const showDebugView =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  return {
    downloadButtonEventCode: 'DOWNLOAD_BUTTON_CLICK',
    appCodeOnIWatch: 'bukeai',
    androidPackageName: 'cn.xinqi.book',
    iosAppStoreUrl: 'https://apps.apple.com/cn/app/id6755860709',
    oneLinkUrl: 'https://m.malink.cn/s/jEf6Zf',
    openInstallAppKey: 'xamsmy',
    autoOpenAppStoreIfNotInWeChat: true,
    weChatAppId: '12',
    showDebugView,
    logger: container.logger(),
  };
};

```

---

## 2. Promise 封装 Web SDK 加载逻辑，并将所有OpenInstall的逻辑封装成一个函数

```ts
// D:\For coding\YunTi\app-download-page\packages\app-download-wrapper\src\useOpenInstall.ts
import { useEffect } from 'react';
import { addDebugInfo } from './debug/debugManager';

declare global {
  interface Window {
    OpenInstall: any;
  }
}
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 防止重复加载
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.charset = 'UTF-8';

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));

    document.body.appendChild(script);
  });
}

export function useOpenInstall({ appKey }: { appKey: string }) {
  useEffect(() => {
    loadScript(`https://res.openinstall.com/openinstall-${appKey}.js`)
      .then(() => {
        const data = window.OpenInstall.parseUrlParams(); ///openinstall-{appKey}.js中提供的api，解析当前网页url中的查询参数并对data进行赋值
        new window.OpenInstall(
          {
            //初始化方法，与openinstall服务器交互，应尽早调用
            appKey: appKey, //appKey为openinstall为应用分配的唯一id（必须传入）
            onready: function () {
              //初始化成功回调方法。当初始化完成后，会自动进入
              const Data = JSON.stringify(data);
              addDebugInfo('OpenInstall initialized with data: ' + Data);
            },
          },
          data
        );
      })
      .catch((error) => {
        addDebugInfo('Failed to load OpenInstall script: ' + error.message);
      });
  }, [appKey]);
}
```

---


**这一点很关键：**

* SDK 加载
* 参数解析
* 实例化
* 运行数据绑定

👉 **全部封装在一个函数中**

---

## 4. 在 `useDownload.ts` 中调用
引入useOpenInstall并调用，同时配好TS

```ts
// D:\For coding\YunTi\app-download-page\packages\app-download-wrapper\src\useDownload.ts
import { useOpenInstall } from './useOpenInstall';//引入useOpenInstall

export type DownloadParams = {
	//省略
	/** openinstall appKey */
	openInstallAppKey: string;
	//省略
}

export const useDownload = (params: DownloadParams): UseDownloadResult => {
  const {
    downloadButtonEventCode,
    appCodeOnIWatch,
    androidPackageName,
    iosAppStoreUrl,
    oneLinkUrl,
    logger,
    weChatAppId,
    openInstallAppKey, //TS类型
    autoOpenAppStoreIfNotInWeChat = true,
    showDebugView,
  } = params;

  useOpenInstall({ appKey: openInstallAppKey });// 调用useOpenInstall
  //省略
  }

```


---

# 四、这一套设计的“技术价值总结”

* OpenInstall Web SDK 通过 **外部 script 异步加载**
* 使用 Promise 封装加载过程，避免时序问题
* 通过 `.then()` 保证 SDK 就绪后再初始化实例
* SDK 初始化逻辑与 UI 解耦
* Hook 只暴露业务方法（`download`），不关心 SDK 细节
* AppKey 作为运行时常量集中管理，避免硬编码扩散


现在做的已经不是「集成 SDK」，而是：

> **对第三方 Web SDK 进行工程化封装，并与 React Hooks 架构融合**

这是**中高级前端工程师的标准做法**。