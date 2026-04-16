# 博客 MCP Server 实现记录

> 记录如何为 P3R 风格博客实现一个 MCP Server，并与自研 Agent（cclin）对接。
> 日期：2025-04-15

---

## 背景与动机

核心需求很简单：让 AI Agent 能直接查询我的博客内容，而不需要手动复制粘贴文章链接。

MCP（Model Context Protocol）是标准化的 AI 工具协议，任何支持 MCP 的 Agent 都能通过同一套接口接入。相比 Skill（绑定特定 Agent）或手动喂 context，MCP 的优势在于 **一次实现，多端复用**。

参考了一篇掘金文章 [《从一个想法到可发布：我把博客接进 MCP 的完整实践》](https://juejin.cn/post/7605807405306757183)，但我的场景更简单——先做一个最小可行版本验证对接。

---

## 技术选型

| 决策点 | 选择 | 理由 |
|--------|------|------|
| MCP SDK | `@modelcontextprotocol/sdk` v1.29.0 | 官方 TypeScript SDK |
| Schema 校验 | `zod` v4.3.6 | SDK 要求的 schema 定义方式 |
| TS 运行时 | `tsx` v4.21.0 | 直接运行 TS，免编译步骤 |
| 传输协议 | stdio | 最简单，本地子进程通信 |
| 内容来源 | 直接读 `content/posts/` | 复用现有 Markdown 文件 |

为什么不复用 `src/lib/blog-loader.ts`？因为它依赖 Next.js 的 `@/` 路径别名和 `process.cwd()` 指向项目根目录的假设。MCP Server 是独立进程，需要自己的内容加载逻辑。

---

## 实现步骤

### Step 1：安装依赖

```bash
pnpm add @modelcontextprotocol/sdk zod
pnpm add -D tsx
```

注意：PowerShell 不支持 `&&` 链接命令，需要分两条执行。

### Step 2：创建内容加载模块

**文件**：`mcp-server/content-loader.ts`

```typescript
// 核心逻辑：用 fs + gray-matter 读取 content/posts/ 下的 Markdown
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

// 通过 import.meta.url 计算项目根目录（避免依赖 process.cwd()）
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(PROJECT_ROOT, 'content', 'posts');
```

导出两个函数：
- `loadPosts()` — 加载所有文章，按日期降序
- `searchPosts(query)` — 关键词搜索（匹配标题、内容、摘要、标签）

关键设计决策：用 `import.meta.url` 而非 `process.cwd()` 来定位项目根目录。因为 MCP Server 是被 Agent 以子进程方式启动的，`process.cwd()` 可能指向 Agent 的工作目录而非博客项目。

### Step 3：创建 MCP Server 入口

**文件**：`mcp-server/index.ts`

注册了 3 个 tool：

#### list_posts
```typescript
server.tool(
  'list_posts',
  '列出所有博客文章的摘要信息',
  { category: z.string().optional().describe('按分类过滤') },
  async ({ category }) => {
    let posts = loadPosts();
    if (category) {
      posts = posts.filter(p =>
        p.category.toUpperCase() === category.toUpperCase()
      );
    }
    // 返回摘要信息（不含完整内容，节省 token）
    return { content: [{ type: 'text', text: JSON.stringify(summary) }] };
  },
);
```

#### read_post
- 输入 `id`（文件名，不含 `.md`）
- 找不到时返回可用 ID 列表（帮助 Agent 自动纠错）
- 返回格式化的 header + 完整 Markdown 内容

#### search_posts
- 输入 `query` 关键词
- 搜索标题、内容、摘要、标签四个维度
- 返回匹配文章的摘要列表

最后连接 stdio 传输并启动：
```typescript
const transport = new StdioServerTransport();
await server.connect(transport);
// 日志输出到 stderr，不干扰 stdio 通信
console.error('[p3r-blog MCP] Server started on stdio');
```

### Step 4：添加启动脚本

在 `package.json` 中添加：
```json
"mcp": "tsx mcp-server/index.ts"
```

### Step 5：配置 Agent 对接

cclin agent 通过 `mcp_config.json` 发现 MCP Server。在 cclin 项目根目录创建：

```json
{
  "mcpServers": {
    "blog": {
      "command": "npx",
      "args": ["tsx", "D:/For coding/project/p3r-inspired-blog/mcp-server/index.ts"]
    }
  }
}
```

cclin 的 `McpClientPool` 会：
1. 读取这个配置
2. 以 `npx tsx ...` 启动子进程
3. 通过 stdio 发送 MCP 协议消息
4. 发现 3 个 tool，注册为 `blog_list_posts` / `blog_read_post` / `blog_search_posts`

---

## 验证过程

### 测试 1：Server 启动

向 stdin 发送 `initialize` 请求：
```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{
  "protocolVersion":"2024-11-05",
  "capabilities":{},
  "clientInfo":{"name":"test","version":"0.1.0"}
}}
```

收到正确响应：
```json
{"result":{
  "protocolVersion":"2024-11-05",
  "capabilities":{"tools":{"listChanged":true}},
  "serverInfo":{"name":"p3r-blog","version":"0.1.0"}
},"jsonrpc":"2.0","id":1}
```

### 测试 2：Tool 列表

发送 `tools/list` 请求，确认 3 个 tool 全部注册：
- `list_posts`（category 可选参数）
- `read_post`（id 必填参数）
- `search_posts`（query 必填参数）

均带有中文描述和完整的 JSON Schema 定义 ✅

---

## 文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `mcp-server/content-loader.ts` | 新建 | 博客内容加载模块 |
| `mcp-server/index.ts` | 新建 | MCP Server 入口（3 个 tool + stdio） |
| `package.json` | 修改 | 添加 `mcp` script、新依赖 |
| cclin `mcp_config.json` | 新建 | Agent 对接配置 |

---

## 注意事项

1. **日志要输出到 stderr**：stdio 模式下，stdout 是 MCP 协议通信通道，所有日志必须走 `console.error`，否则会破坏协议消息
2. **路径中的空格**：Windows 路径 `D:/For coding/...` 包含空格，在 JSON 配置中直接写即可，`npx` 会正确处理
3. **gray-matter 是共享依赖**：博客项目本身已经有 `gray-matter`，MCP Server 直接复用，不需要额外安装
