# MCP Server 演进路线图

> 记录博客 MCP Server 的长期规划和未来扩展方向。
> 创建时间：2025-04-15

---

## Phase 1：最小可行版本 ✅ 当前阶段

**目标**：在博客项目中实现 stdio MCP Server，验证与 cclin agent 的对接。

- [x] 暴露 3 个基础 tool：`list_posts` / `read_post` / `search_posts`
- [x] 直接读取 `content/posts/` Markdown 文件
- [x] stdio 传输，`tsx` 直接运行
- [ ] 与 cclin agent 成功对接验证

---

## Phase 2：丰富内容覆盖

**目标**：从"文章检索器"进化为"整站内容助手"。

### 扩展 Tools
- `list_topics` — 列出所有专题及其文章
- `read_topic_post` — 读取专题下的指定文章
- `read_site_info` — 返回站点基本信息（名称、描述、技术栈）
- `get_profile` — 返回博主个人信息（技术方向、项目经历）

### 数据模型升级
参考 [掘金文章](https://juejin.cn/post/7605807405306757183) 的多资源结构：
- `blog` — 独立博客文章
- `topic` / `topic_article` — 系列专题
- `site_page` — 站点页面信息
- `profile` — 个人资料

---

## Phase 3：独立项目 + 个人认知层

**目标**：从博客子模块独立为通用的 Personal Context MCP Server。

### 架构升级
- 独立 repo（如 `personal-context-mcp`）
- 分离为两层：
  - **Profile 层**（MCP Resource）：结构化个人信息，YAML 存储
  - **Knowledge 层**（MCP Tool）：知识库 CRUD

### Profile 维度设计
| 维度 | 示例 |
|------|------|
| 个人基本信息 | 名字、角色、技术方向 |
| 技术栈偏好 | TypeScript, React, Next.js, Node.js |
| 编码习惯 | 中文注释、pnpm、ESM 优先 |
| 当前项目列表 | p3r-blog、cclin agent 等 |
| 设备环境 | Windows 11, PowerShell, Tailscale |
| 学习方向 | 前端面试、Agent 开发 |
| 沟通风格 | 中文回复、直接不废话 |

### 核心价值
- 任何支持 MCP 的 agent 连接后，读一下 resource 就能"认识你"
- 换 agent / 换设备时无需重新配置 system prompt

---

## Phase 4：知识库 + 语义检索（RAG）

**目标**：从简单关键词搜索进化到语义理解检索。

### 技术选型（TypeScript 生态）

| 方案 | 特点 | 适用规模 |
|------|------|----------|
| **Orama** | 全文+向量+混合搜索，纯 TS，生态活跃 | 中大规模 |
| **vectra** | 微软出品，简单文件存储 | 小规模 |
| **ruvector** | Rust 核心，性能最强 | 大规模 |

### Embedding 方案
- **API 方式**：OpenAI text-embedding-3-small（效果好，需网络）
- **本地模型**：Transformers.js + 小模型（离线可用）

### 知识库 Tools
- `search_knowledge(query)` — 语义/关键词混合检索
- `add_knowledge(content, tags)` — 新增知识条目
- `get_context(topic)` — 获取某主题的相关上下文

### 初始数据迁移
- 现有 Antigravity knowledge items
- 博客文章自动索引
- 学习笔记 / 面试题整理

---

## Phase 5：远程部署 + 多 Agent 支持

**目标**：部署到服务器，跨设备使用。

### 传输层升级
- 添加 Streamable HTTP 传输（推荐的远程协议）
- 通过启动参数切换 stdio / HTTP 模式
- 可选：OAuth 2.0 认证（Bearer Token）

### 部署方式
- Docker 容器化
- 部署到云服务器 / NAS
- 通过 Tailscale 组网访问（已有基础设施）

### 多 Agent 接入
- Antigravity / Claude Code CLI
- cclin agent（自研）
- Cursor / Codex 等其他 agent

---

## Phase 6：MCP + Skill 组合

**目标**：MCP 和 Skill 互补，打造"Agent 即我"的终极形态。

### 分工
- **MCP**：动态数据查询（知识库、文章内容、实时信息）
- **Skill**：静态指令模板（特定任务的标准操作流程）

### 愿景
> 长期积累之后，Agent 即我——AI 不仅知道我的代码风格，还了解我的知识体系、
> 思维方式和决策偏好。无论换什么 agent 工具，连接同一个 MCP server 就能
> 无缝衔接。

---

## 参考资料

- [掘金：从一个想法到可发布——我把博客接进 MCP 的完整实践](https://juejin.cn/post/7605807405306757183)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Orama 全文+向量搜索引擎](https://github.com/askorama/orama)
