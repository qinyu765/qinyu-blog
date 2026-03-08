---
title: "ESM 与 CommonJS：搞懂 Node 里的模块解析规则"
date: "2026.03.08"
category: "TECH"
excerpt: "日常写业务代码时很少区分 ESM 和 CJS，但一旦碰到 Node 直接执行的场景，规则就变得不可忽视。"
---

在日常的前端业务开发中，你几乎不需要操心模块系统的问题。`.ts` 文件里写 `import/export`，编译工具自动处理一切，感知不到 ESM 和 CommonJS 的差别。但只要你需要跑一个 Node 脚本、写一个工具链配置文件、或者排查一个奇怪的 `require is not defined` 报错，ESM 和 CJS 的区分就会突然变得至关重要。

## 两套模块系统的本质差异

CommonJS 是 Node.js 的传统模块系统。`require()` 同步加载，`module.exports` 导出，导出的是值的快照——更像是"拿到了一个对象"。ESM 则是 JavaScript 语言层面的模块标准，`import/export` 是语法级别的声明，加载基于静态分析，导出采用 Live Bindings（活绑定）机制，被导出方修改值后，导入方能感知到变化。

这两套系统在设计哲学上有根本区别。CJS 是运行时解析的，你甚至可以在 `if` 语句里动态 `require`。ESM 是编译时解析的，依赖关系在代码执行前就确定了，这也是为什么 ESM 天然支持 tree-shaking 和 top-level await。

## Node 怎么决定用哪套规则

当 Node 直接执行一个文件时，它用一套清晰但容易踩坑的规则来判断这个文件该按 ESM 还是 CJS 解析。规则本身不复杂：`.mjs` 文件一定按 ESM 解析，`.cjs` 文件一定按 CJS 解析，`.js` 文件则取决于最近的 `package.json` 是否声明了 `"type": "module"`——声明了就按 ESM，没声明就按 CJS。

坑就在 `.js` 这个"看情况"的逻辑上。大多数项目的根 `package.json` 没有声明 `"type": "module"`，所以 `.js` 默认按 CJS 解析。这就是为什么很多项目里的脚本文件用 `.mjs` 后缀——它不依赖 `package.json` 的配置，直接告诉 Node "这是 ESM"，减少了歧义。而配置文件用 `.cjs` 后缀则是另一个方向的保险：即使未来 `package.json` 加上了 `"type": "module"`，配置文件仍然能强制按 CJS 执行，因为很多工具在加载配置时走的是 `require()` 路径。

至于 `.ts` 和 `.tsx`，Node 原生不认识它们。这些文件需要 TypeScript 编译器、`ts-node`、Vite 或 Metro 等工具链代为处理，处理后再按上述规则解析。

## 互操作的三个常见陷阱

ESM 和 CJS 混用时，最容易踩的坑集中在三个场景。

第一个是在 ESM 文件中导入 CJS 包。CJS 的导出本质上是一个对象（`module.exports = ...`），在 ESM 中导入时更稳妥的写法是默认导入再解构：`import pkg from 'some-cjs-package'` 然后 `const { foo } = pkg`。直接用 `import { foo } from 'some-cjs-package'` 虽然有时候能工作（依赖 Node 对 CJS 的具名导出推断），但并非所有包都支持，不够可靠。

第二个是在 CJS 文件中引用 ESM 包。`require('esm-package')` 通常会直接报错，因为 ESM 的加载模型是异步的。CJS 中要加载 ESM 包，只能走动态 `import()`：`const mod = await import('esm-package')`，但这意味着你必须在异步上下文中使用。

第三个是 ESM 文件中没有 `__dirname` 和 `__filename`。这两个是 CJS 的全局变量，在 ESM 中不存在。替代方案是用 `import.meta.url` 配合 `fileURLToPath` 和 `path.dirname` 来手动构造。

## 项目中为什么同时存在 .mjs 和 .cjs

这通常是为了降低迁移成本并兼容不同工具的预期。脚本文件用 `.mjs`，不需要改动仓库的默认配置就能使用 ESM 语法，对 Node 执行来说更"所见即所得"。配置文件用 `.cjs`，无论仓库未来怎么调整 `"type"` 字段，它们都能稳定工作。这种"脚本层用 ESM、配置层用 CJS"的分层策略在实际项目中非常常见，是务实的工程选择而非混乱的标志。

## 排查问题的自检清单

当你遇到模块相关的报错时，按以下顺序排查通常能快速定位问题：这个文件是在 Node 直接执行还是在打包工具下运行？文件后缀是 `.mjs`、`.cjs` 还是 `.js`？最近的 `package.json` 有没有 `"type": "module"`？是不是在 ESM 文件里用了 `__dirname` 或 `require`？是不是在 CJS 文件里 `require()` 了一个纯 ESM 包？

这些问题覆盖了绝大多数模块解析错误的根因。写业务代码的时候确实不需要时刻想着这些规则，但在它们引发问题的那个瞬间——通常是你在跑脚本、改配置、或者升级依赖的时候——能快速定位到是模块系统层面的问题，就已经解决了一半。
