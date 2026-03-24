---
title: "数据格式转换的时机"
date: "2026.03.24"
category: "TECH"
excerpt: "写ReAct循环时偶然考虑的问题，从一次格式思考出发，聊聊数据在系统内部该用什么形态流转"
---

最近在写新项目 cclin（Agent cli） 的 ReAct 循环，
其中的 `react-loop.ts` 里，有两套格式表示同一个东西——"LLM 请求调用的工具"。一种是内部流转用的 `{ id, name, input }`，字段平铺，`input` 保持对象形态；另一种是 OpenAI 协议要求的 `AssistantToolCall`，多嵌套了一层 `function`，而且 `arguments` 是 JSON 字符串。当时有人提了个直觉性的问题：既然最终写入 history 都要用 OpenAI 格式，为什么不在提取的时候就直接转过去？

这个问题初看是代码风格层面的——多一个函数少一个函数，似乎无所谓。但它背后藏着一个在几乎所有系统里都会反复出现的架构问题：数据在系统内部各层之间，到底应该以什么形态流转？这个选择决定了模块间的耦合程度、需求变化时的修改范围，以及新功能扩展的难度。

## 一个"随便吧"背后的架构问题

先来看这两套格式的具体区别。内部流转的格式长这样：

```typescript
{ id: string; name: string; input: unknown }
```

而 OpenAI 协议要求的格式是这样：

```typescript
{
    id: string
    type: 'function'
    function: {
        name: string
        arguments: string  // JSON 字符串，不是对象
    }
}
```

差别集中在两点：OpenAI 格式多了一层 `function` 嵌套，以及 `arguments` 必须是 JSON 字符串而非对象。一旦提前转成 OpenAI 格式，后续任何需要访问工具参数的代码都得先 `JSON.parse` 一次。

这就引出了真正的问题。在 cclin 的 ReAct 循环中，这份工具调用数据有三个消费者：`parseLLMResponse` 用 `name` 和 `input` 做语义判定，`executeTool` 把 `input` 直接传给工具函数，`buildAssistantToolCalls` 转为 OpenAI 格式写入 history。前两个消费者需要 `input` 是对象，只有最后一个需要 JSON 字符串。如果在源头就 stringify 了，三分之二的下游都要做反序列化——省了一个格式转换函数，却引入了两次 `JSON.parse`，还让每个消费者都必须知道"这里拿到的是字符串，用之前要 parse"。

## 两种对立的策略

这个取舍在软件架构中有两个经典名字。第一种叫 Early Normalization，入口处统一——数据进入系统的第一时间就转成最终消费者需要的格式，后续所有模块都用同一种格式。好比国际机场入关时要求所有人换成本国货币，全场景统一，没有歧义。但如果这种"标准货币"在某些场景下不太好用（比如 stringify 后的字符串），大家就得自己再换回去。当目标格式存在信息损失时，内部消费者的工作量反而增加了。

第二种叫 Late Serialization，出口处转换——系统内部用最自然、信息最丰富的形态流转，只在数据真正离开系统时才转成目标格式。发给外部 API、写入数据库、返回给调用方，这些才是触发转换的时机。好比在国内用汉语交流，只在寄国际信时翻译成英文。内部模块拿到的永远是最方便操作的形态，更换外部协议也只需要改出口 adapter，核心逻辑不用动。代价是系统内可能同时存在多种格式，需要开发者清楚"哪一层用哪种"。

cclin 选择了后者。`normalizeLLMResponse` 输出 `{ id, name, input }` 对象形态，`parseLLMResponse` 和 `executeTool` 直接使用，只有 `buildAssistantToolCalls` 在写入 history 那一刻才做序列化。判断依据很简单：`input` 的三个消费者中两个需要对象、一个需要字符串，延迟序列化是多数消费者友好的选择。

## 当复杂度找上门

在 cclin 当前阶段——单一 LLM provider、单一输出格式——格式转换的时机影响不大，最多差一个函数。但系统一旦开始变复杂，这个选择就会成为架构的分水岭。

假设将来要同时支持 OpenAI 和 Anthropic API。两家的工具调用返回格式完全不同：OpenAI 用 `tool_calls` 数组，`arguments` 是 JSON 字符串；Anthropic 用 `content` 数组里的 `tool_use` block，`input` 天然就是对象。如果在入口就强制转成 OpenAI 格式，Anthropic adapter 就得无缘无故地 `JSON.stringify(input)`，而下游 `executeTool` 又得 `JSON.parse` 回来，入口层和 OpenAI 协议就绑死了。反过来，如果内部统一用对象形态的 `{ id, name, input }`，每家 provider 只需要各写一个入口 adapter 做翻译，核心的 ReAct 循环完全不用动。

```typescript
// Anthropic adapter —— input 天然是对象，直接映射
function fromAnthropic(block): InternalToolCall {
    return { id: block.id, name: block.name, input: block.input }
}

// OpenAI adapter —— arguments 是字符串，parse 一次
function fromOpenAI(tc): InternalToolCall {
    return { id: tc.id, name: tc.function.name, input: JSON.parse(tc.function.arguments) }
}
```

类似的场景还有工具参数校验。如果 `input` 保持对象形态，拿到手就能用 JSON Schema 直接校验；如果是字符串，得先 parse 成对象，校验完还要决定传给 `executeTool` 的是 parse 后的对象还是原字符串。数据持久化也一样——对象序列化到磁盘就是一次 `JSON.stringify`，读取时一次 `JSON.parse`；但如果内部流转的就是字符串，持久化时会出现字符串嵌套字符串的情况，反序列化容易踩坑。规律很清晰：越是在中间环节会被反复加工的数据，越适合用对象形态保留完整信息；越是只做透传、不需要理解其含义的数据，提前转换也无妨。

## 绕开常见的坑

围绕格式转换，有几种反模式几乎在每个项目里都能看到。第一种是格式透传——内部函数直接操作外部 API 的数据结构，没有定义自己的中间表示。比如 ReAct 循环里直接用 `ChatCompletionMessageToolCall` 类型，每个函数都在和 OpenAI SDK 的类型打交道。一旦换一家 LLM SDK，所有函数签名和内部逻辑都要跟着改。解法是定义一个内部类型，让 adapter 负责翻译，cclin 的 `InternalToolCall` 就是这个角色。

第二种是过度序列化。数据被 stringify 之后，下游立刻又 `JSON.parse` 回来——序列化和反序列化紧贴在一起，中间没有任何环节真正需要字符串形态。这种"三明治"操作不仅浪费 CPU，还会引入循环引用、特殊字符转义、数字精度丢失等 bug 风险。修复思路很简单：只在真正需要字符串的那个点才做序列化，其余时间保持对象形态传递。

第三种是格式选择焦虑——花大量时间纠结中间格式该长什么样，最后设计出一个既不像入口也不像出口的"第三种格式"。中间格式不需要精心设计，它只要满足两个条件就够了：信息完整，不丢失下游可能需要的字段；访问方便，消费者能直接用。cclin 的 `{ id, name, input }` 几乎就是 `ToolUseBlock` 去掉了 `type` 字段，足够简单，足够用。

遇到"该不该提前转换格式"的问题时，有一个简单的判断流程：先看这份数据在内部有几个消费者。如果只有一个且直接送往出口，提前转换没有害处；如果有多个，看它们是否都能接受同一种格式——能接受就早转，不能就晚转；如果还不确定将来会有多少消费者，默认延迟转换，保持灵活性。

格式转换和翻译一样——越靠近边界做越好，系统内部应该说"母语"，只在跟外界打交道的那个瞬间才切换语言。在 cclin 里，母语是 `{ id, name, input }`，翻译员是 `buildAssistantToolCalls()`，国境线是 `history.push()`。这个思维模型不只适用于 Agent 开发——任何涉及外部协议对接的系统，从前后端 API 对接到微服务通信，都会反复遇到同一个问题：内部用什么形态最方便，在哪里转为外部需要的格式。
