---
title: "从零实现 React：理解框架背后的设计"
date: "2026.03.10"
category: "TECH"
excerpt: "通过手写迷你 React，拆解 Fiber、Reconciliation 与 Hooks 的核心原理"
---

来源：[Build Your Own React](https://pomb.us/build-your-own-react/)

如果有人问我"学 React 最有效的方式是什么"，我会给出一个听起来有点反直觉的答案：不要去学 React，去写一个 React。Rodrigo Pomber 的那篇 Build Your Own React 正是做了这件事——用不到 300 行代码，从零构建了一个叫 Didact 的迷你框架，覆盖了 React 16.8 以来最核心的架构设计。

## JSX 与 createElement：一切始于一个普通对象

很多人在刚接触 React 时，会把 JSX 当成某种特殊的模板语言。但当你真正去看 Babel 的编译产物时，所谓的 JSX 不过是 `React.createElement()` 调用的语法糖。`<h1 title="foo">Hello</h1>` 会被编译成 `React.createElement("h1", { title: "foo" }, "Hello")`，而 `createElement` 做的事情极其简单——它返回一个普通的 JavaScript 对象，包含 `type`（标签名或函数组件引用）和 `props`（属性加上 children）。这个对象就是所谓的 React Element，也就是虚拟 DOM 的最小单元。

理解了这一点，很多困惑就不存在了。虚拟 DOM 并不是什么黑科技，它就是一棵由 JS 对象组成的树。`render` 函数的工作也很直白：根据 `type` 调用 `document.createElement` 创建真实 DOM 节点，把 `props` 里除了 `children` 以外的属性赋值上去，然后递归地对 `children` 做同样的事，最后用 `appendChild` 挂载到容器中。这就是 React 渲染的本质——从对象树到 DOM 树的一次映射。

## Fiber：当递归成为瓶颈

但上面那个递归的 `render` 有一个致命的问题：一旦开始就无法停下来。如果组件树很大，整个递归过程会长时间占用主线程，用户输入、动画帧更新都得排队等着。这在交互密集的应用里是不可接受的。React 团队意识到了这个问题，于是在 16 版本引入了全新的 Fiber 架构。Fiber 的核心思路说起来并不复杂：把一次不可中断的大渲染，拆分成许多可中断的小工作单元。每完成一个单元，就把控制权还给浏览器——如果浏览器这时候需要处理用户点击或者刷新动画，它完全可以先去做，等空闲了再回来继续未完成的渲染。

Didact 用 `requestIdleCallback` 来模拟这个调度循环。虽然真正的 React 已经用自研的 Scheduler 包替代了它，但概念完全相同：一个 `workLoop` 不断从队列中取出下一个工作单元执行，每次执行前检查 `deadline.timeRemaining()` 是否还有剩余时间，不够了就让出来。这就是所谓的"时间切片"。

为了支持这种可中断的遍历，Fiber 选择了链表式的树结构而非传统的递归树。每个 Fiber 节点有三个关键指针：`child` 指向第一个子节点，`sibling` 指向下一个兄弟节点，`parent` 指向父节点。遍历的顺序是：先深入 `child`，没有 `child` 就找 `sibling`，没有 `sibling` 就回到 `parent` 再找 `parent` 的 `sibling`（相当于"叔叔"节点），如此循环直到回到根节点。这种遍历方式的好处在于，它在任何一个节点都可以暂停，因为下一个要访问的节点总是可以通过这三个指针直接算出来，不依赖调用栈。

## 两阶段提交与 Reconciliation

有了 Fiber 和时间切片，新的问题又来了。如果我们在构建 Fiber 树的过程中就直接往 DOM 上挂节点，而渲染恰好在中途被中断，用户就会看到一个只渲染了一半的页面。React 对此的解决方案是把整个渲染过程分成两个阶段：Render 阶段负责构建新的 Fiber 树、计算差异，这个阶段完全在内存中进行、可以随时中断；Commit 阶段则是一次性把所有变更同步应用到真实 DOM 上，这个阶段不可中断。Didact 用 `wipRoot`（work in progress root）来追踪正在构建的 Fiber 树，只有当所有工作单元都完成、没有 `nextUnitOfWork` 时，才调用 `commitRoot` 把整棵树一次性提交。

而 Reconciliation——也就是通常说的 diff 算法——发生在 Render 阶段。它的工作是同时遍历旧的 Fiber 链表和新的 Element 数组，通过比较 `type` 来决定每个节点的命运。类型相同，说明 DOM 节点可以复用，只需要更新 props，标记为 `UPDATE`；类型不同且有新元素，需要创建新的 DOM 节点，标记为 `PLACEMENT`；类型不同且只有旧 Fiber 没有对应的新元素，说明这个节点该被移除，标记为 `DELETION`。每个 Fiber 上的 `effectTag` 就像一个待办标签，Commit 阶段按照这些标签执行对应的 DOM 操作。

这里 Didact 做了一个有意的简化：它没有实现 `key`。在真实的 React 中，`key` 是列表 diff 的关键优化——它帮助 React 识别哪些子元素只是换了位置而不是被删除重建。但即便没有 `key`，Didact 的 Reconciliation 逻辑已经足以说明核心思路：通过最小化 DOM 操作来提升性能，而不是每次都推倒重来。

## 函数组件与 Hooks 的实现

Didact 的最后两步处理了函数组件和 `useState`，这也是日常开发中最直接相关的部分。函数组件与原生 DOM 元素（Host Component）在 Fiber 层面的区别有两个：函数组件对应的 Fiber 没有真实 DOM 节点，它的 children 来自函数执行的返回值而非 `props.children`。所以在 `performUnitOfWork` 中，遇到函数组件就调用 `fiber.type(fiber.props)` 来获取子元素，然后走和原生元素一样的 Reconciliation 流程。在 Commit 阶段则需要特殊处理——挂载或删除节点时，要沿着 `parent` 指针向上找到最近的有真实 DOM 的 Fiber。

`useState` 的实现则揭示了 Hooks 最核心的秘密：它依赖调用顺序。每个 Fiber 节点上有一个 `hooks` 数组，每次调用 `useState` 就按顺序往这个数组里存一个 hook 对象并递增索引。下次渲染同一个组件时，React 通过 `alternate`（上一次 commit 的旧 Fiber）取出旧的 `hooks` 数组，按相同的索引取出旧 hook 来恢复状态。`setState` 并不立即修改状态，而是把 action 推入 hook 的 `queue` 队列，然后设置一个新的 `wipRoot` 来触发新一轮渲染。等下次渲染执行到这个 `useState` 时，才从队列中依次取出 action 执行来计算新状态。

```js
function useState(initial) {
  const oldHook = wipFiber.alternate?.hooks?.[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }
  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => { hook.state = action(hook.state) })

  const setState = action => {
    hook.queue.push(action)
    wipRoot = { dom: currentRoot.dom, props: currentRoot.props, alternate: currentRoot }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}
```

到这里也就明白了那条铁律——"不要在 if/for 里调用 Hooks"——的真正原因：如果调用顺序变了，索引对不上，React 就会把状态张冠李戴。这条规则看起来像 eslint 的武断约定，但它其实是实现机制的必然约束。

## 从 Didact 看真实 React

Didact 刻意使用了与真实 React 源码相同的变量名和函数名。如果你在浏览器里给一个函数组件打断点，你会在调用栈里看到 `workLoop`、`performUnitOfWork`、`updateFunctionComponent` 这些一模一样的名字。当然，真实 React 在 Didact 的基础上还有大量的优化和功能是这 300 行代码覆盖不到的：用 `key` 优化列表 diff、`useEffect` 和其他 Hooks 的实现、`className`/`style` 等特殊 props 的处理、对 `<Fragment>` 等特殊组件的支持，以及整套优先级调度机制。但 Didact 给出的骨架已经足够清晰——Fiber 树的构建与遍历、两阶段提交、基于 type 的 Reconciliation、基于数组索引的 Hooks——真实 React 的每一个复杂特性都是在这个骨架上长出来的。