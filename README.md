# OpenPolis

<div align="center">

**面向全球中小型政党、地方政府和公民组织的轻量级治理操作系统**

**A lightweight governance operating system for political organizations, local governments, and civic institutions worldwide**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/aigclist/OpenPolis/workflows/CI/badge.svg)](https://github.com/aigclist/OpenPolis/actions)

[English](#english) | [中文](#中文)

</div>

---

# 中文

## 🎯 这是什么？

OpenPolis 是一个 **AI 驱动的治理平台**，专为资源有限的组织设计：

- 🏛️ **小型政党** - 管理竞选活动、政策制定、成员协调
- 🏙️ **地方政府** - 处理公共事务、项目跟进、民意反馈
- 🤝 **NGO 组织** - 协调志愿者、管理项目、追踪影响力
- 📋 **公共部门** - 简化行政流程、提高响应速度

**核心理念**：用一个中央 AI 大脑协调多个专业子代理，自动处理重复性工作，让人类专注于需要判断力的决策。

**灵感来源**：借鉴 OGAS（全国自动化管理系统）的控制论原理，但去除了监控和强制控制元素，适配现代民主治理。

## ⚡ 快速开始

### 前置要求

确保你的电脑已安装：

- **Node.js** 18 或更高版本 → [下载地址](https://nodejs.org/)
- **pnpm** 包管理器 → 安装命令：`npm install -g pnpm`

### 5 分钟安装

```bash
# 1. 克隆项目
git clone https://github.com/aigclist/OpenPolis.git
cd OpenPolis

# 2. 安装依赖（首次安装可能需要 3-5 分钟）
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 用文本编辑器打开 .env 文件，根据注释填写必要的配置

# 4. 启动开发服务器
pnpm dev
```

✅ 打开浏览器访问 **http://localhost:3000** 即可看到系统界面！

## 📖 详细安装指南

<details>
<summary><b>Windows 用户</b></summary>

1. **安装 Node.js**
   - 访问 https://nodejs.org/
   - 下载 LTS 版本（推荐 18.x 或 20.x）
   - 运行安装程序，保持默认选项

2. **安装 pnpm**
   ```powershell
   npm install -g pnpm
   ```

3. **克隆项目**
   ```powershell
   git clone https://github.com/aigclist/OpenPolis.git
   cd OpenPolis
   ```

4. **安装依赖**
   ```powershell
   pnpm install
   ```

5. **配置环境**
   - 复制 `.env.example` 为 `.env`
   - 用记事本或 VS Code 打开 `.env`
   - 根据文件中的注释填写配置

6. **启动项目**
   ```powershell
   pnpm dev
   ```

</details>

<details>
<summary><b>macOS / Linux 用户</b></summary>

```bash
# 1. 安装 Node.js（使用 nvm 推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 2. 安装 pnpm
npm install -g pnpm

# 3. 克隆并安装
git clone https://github.com/aigclist/OpenPolis.git
cd OpenPolis
pnpm install

# 4. 配置环境
cp .env.example .env
nano .env  # 或使用你喜欢的编辑器

# 5. 启动
pnpm dev
```

</details>

## 🚀 部署到生产环境

### 方式 1：Cloudflare Pages（推荐）

OpenPolis 针对 Cloudflare 进行了优化，部署简单且免费：

1. 构建项目：`pnpm build`
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 Pages → 创建项目 → 连接 GitHub 仓库
4. 构建设置：
   - 构建命令：`pnpm build`
   - 输出目录：`apps/web/.next`
   - Node 版本：18 或 20
5. 配置环境变量（复制 `.env.example` 中的变量）
6. 推送代码，Cloudflare 自动构建部署

### 方式 2：Vercel

```bash
npm install -g vercel
vercel
```

### 方式 3：传统服务器

```bash
pnpm build
pnpm start
```

### 方式 4：Docker（即将支持）

```bash
docker build -t openpolis .
docker run -p 3000:3000 --env-file .env openpolis
```

## 🧠 核心功能

### 1. AI 中央大脑

一个统一的 AI 控制台，理解你的需求并自动分配给专业子代理：

- 📝 **会议转任务**：上传会议记录，自动提取行动项和责任人
- 📊 **每日简报**：汇总过夜变化、延迟事项、风险信号
- ✍️ **文档起草**：根据模板和历史记录自动生成内部文件
- 🔔 **延迟追踪**：自动发现逾期任务并发送提醒

### 2. 模块化工作流

```
优先事项 (Priority Items)
  ↓ 追踪重大议题、活动、项目
行动计划 (Action Plans)
  ↓ 结构化的执行方案和阶段划分
任务跟进 (Task Follow-up)
  ↓ 分配工作、设置截止日期、监控进度
材料输出 (Materials & Outputs)
  ↓ 管理报告、通知、资产、文档
反馈收集 (Feedback)
  ↓ 汇总现场报告、公众意见、问题反馈
检查复盘 (Inspection & Review)
  ↓ 持续改进、经验总结、纠正措施
```

### 3. 治理与问责

- 🔒 **权限控制**：基于角色的访问控制，代理在有限权限下运行
- 📜 **审计日志**：所有 AI 操作可追溯、可审查
- ✋ **人工批准**：敏感操作（发布、资源分配）需要人工确认
- 🔍 **证据链**：每个决策都有完整的依据记录

## 🤖 AI 代理系统

### 中央大脑工作流

```
用户请求 → 理解意图 → 加载上下文 → 委派子代理 →
合并结果 → 检查批准 → 执行 → 写回记录 → 返回用户
```

### 专业子代理

1. **Intake Agent** - 从消息、报告、会议记录中提取结构
2. **Task Agent** - 将目标分解为任务、责任人、截止日期
3. **Drafting Agent** - 起草通知、计划、简报、报告
4. **Follow-up Agent** - 追踪截止日期、延迟、阻塞
5. **Summary Agent** - 汇总多源更新为每日/每周摘要
6. **Risk Agent** - 检测警告信号、重复失败、异常延迟
7. **Review Agent** - 准备检查包、纠正清单、跟进记录
8. **Governance Guard Agent** - 检查权限、发布规则、批准要求

### 自动化策略

- ✅ **自动执行**：摘要、分类、聚类、起草、提醒、任务创建
- ⚠️ **自动执行+审计**：优先级变更、跨模块任务、风险标记
- 🛑 **需要人工确认**：外部发布、预算调整、权限变更、删除操作

## 📁 项目结构

```
OpenPolis/
├── apps/web/              # Next.js 15 Web 应用
├── packages/
│   ├── contracts/         # 领域契约和 DTO
│   ├── domain/            # 核心业务逻辑
│   ├── application/       # 应用服务层
│   ├── db/                # 数据库适配器（SQLite/Drizzle）
│   ├── runtime/           # 依赖注入组合根
│   ├── governance/        # 策略和权限规则
│   ├── i18n/              # 国际化（中英文）
│   └── ui/                # 共享 UI 组件
├── docs/
│   ├── adr/               # 架构决策记录
│   └── plans/             # 系统设计文档
└── scripts/               # 构建和维护脚本
```

## 🛠️ 开发命令

```bash
pnpm dev          # 开发模式（热重载）
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm test         # 运行测试
pnpm typecheck    # 类型检查
pnpm lint         # 代码检查
```

## 🎓 使用场景示例

### 场景 1：每日晨会简报

```
用户：给我今天的关键情况

AI 处理：
1. Summary Agent 汇总过夜变化
2. Risk Agent 检测延迟和风险
3. Task Agent 列出今日待办

输出：
- 3 个新反馈需要处理
- 2 个任务逾期
- 1 个风险信号（预算执行落后 15%）
- 今日 5 个优先任务
```

### 场景 2：会议转任务

```
用户：上传 meeting-notes.txt

AI 处理：
1. Intake Agent 提取决策和行动项
2. Task Agent 创建任务并分配
3. Drafting Agent 生成会议纪要

输出：
- 创建 7 个任务
- 分配给 4 个成员
- 生成格式化纪要
- 自动发送提醒
```

## 🔐 安全与隐私

- 🔒 **数据隔离**：工作区数据完全隔离
- 🔑 **加密存储**：敏感字段加密
- 📝 **审计日志**：操作不可篡改
- 🚫 **无监控**：不收集用户行为，不进行政治评分
- ✅ **开源透明**：代码公开可审计

## 🌍 国际化

- 🇬🇧 English - 完整支持
- 🇨🇳 简体中文 - 完整支持
- 🌐 其他语言 - 欢迎贡献翻译

## 🤝 贡献指南

我们欢迎各种形式的贡献！

1. Fork 项目
2. 创建分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m "feat: add feature"`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE)

## 🙏 致谢

- **OGAS 研究** - 借鉴控制论原理
- **GovStack** - 数字公共基础设施架构
- **UNDP** - 数字治理指南

## 📞 联系与支持

- 🐛 [报告 Bug](https://github.com/aigclist/OpenPolis/issues)
- 💡 [功能建议](https://github.com/aigclist/OpenPolis/discussions)
- 📖 [文档](./docs/)

---

# English

## 🎯 What is this?

OpenPolis is an **AI-powered governance platform** designed for resource-constrained organizations:

- 🏛️ **Small Political Parties** - Manage campaigns, policy-making, member coordination
- 🏙️ **Local Governments** - Handle public affairs, project tracking, citizen feedback
- 🤝 **NGO Organizations** - Coordinate volunteers, manage projects, track impact
- 📋 **Public Departments** - Streamline administrative processes, improve responsiveness

**Core Concept**: A central AI brain coordinates multiple specialized sub-agents to automate repetitive work, allowing humans to focus on decisions requiring judgment.

**Inspiration**: Based on cybernetic principles from OGAS (All-State Automated System), adapted for modern democratic governance **without** surveillance or coercive control.

## ⚡ Quick Start

### Prerequisites

Ensure you have installed:

- **Node.js** 18 or higher → [Download](https://nodejs.org/)
- **pnpm** package manager → Install: `npm install -g pnpm`

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/aigclist/OpenPolis.git
cd OpenPolis

# 2. Install dependencies (may take 3-5 minutes on first install)
pnpm install

# 3. Configure environment variables
cp .env.example .env
# Open .env in a text editor and fill in required configuration

# 4. Start development server
pnpm dev
```

✅ Open your browser and visit **http://localhost:3000** to see the system!

## 📖 Detailed Installation Guide

<details>
<summary><b>Windows Users</b></summary>

1. **Install Node.js**
   - Visit https://nodejs.org/
   - Download LTS version (18.x or 20.x recommended)
   - Run installer with default options

2. **Install pnpm**
   ```powershell
   npm install -g pnpm
   ```

3. **Clone project**
   ```powershell
   git clone https://github.com/aigclist/OpenPolis.git
   cd OpenPolis
   ```

4. **Install dependencies**
   ```powershell
   pnpm install
   ```

5. **Configure environment**
   - Copy `.env.example` to `.env`
   - Open `.env` with Notepad or VS Code
   - Fill in configuration based on comments

6. **Start project**
   ```powershell
   pnpm dev
   ```

</details>

<details>
<summary><b>macOS / Linux Users</b></summary>

```bash
# 1. Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 2. Install pnpm
npm install -g pnpm

# 3. Clone and install
git clone https://github.com/aigclist/OpenPolis.git
cd OpenPolis
pnpm install

# 4. Configure environment
cp .env.example .env
nano .env  # or use your preferred editor

# 5. Start
pnpm dev
```

</details>

## 🚀 Production Deployment

### Option 1: Cloudflare Pages (Recommended)

OpenPolis is optimized for Cloudflare with simple, free deployment:

1. Build project: `pnpm build`
2. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Go to Pages → Create Project → Connect GitHub repository
4. Build settings:
   - Build command: `pnpm build`
   - Output directory: `apps/web/.next`
   - Node version: 18 or 20
5. Configure environment variables (copy from `.env.example`)
6. Push code, Cloudflare auto-builds and deploys

### Option 2: Vercel

```bash
npm install -g vercel
vercel
```

### Option 3: Traditional Server

```bash
pnpm build
pnpm start
```

### Option 4: Docker (Coming Soon)

```bash
docker build -t openpolis .
docker run -p 3000:3000 --env-file .env openpolis
```

## 🧠 Core Features

### 1. Central AI Brain

A unified AI console that understands your needs and delegates to specialized sub-agents:

- 📝 **Meeting to Tasks**: Upload meeting notes, auto-extract action items and owners
- 📊 **Daily Briefing**: Aggregate overnight changes, delays, risk signals
- ✍️ **Document Drafting**: Auto-generate internal documents from templates and history
- 🔔 **Delay Tracking**: Auto-detect overdue tasks and send reminders

### 2. Modular Workflows

```
Priority Items
  ↓ Track major issues, campaigns, projects
Action Plans
  ↓ Structured execution plans and stages
Task Follow-up
  ↓ Assign work, set deadlines, monitor progress
Materials & Outputs
  ↓ Manage reports, notices, assets, documents
Feedback
  ↓ Aggregate field reports, public input, issues
Inspection & Review
  ↓ Continuous improvement, lessons learned, corrections
```

### 3. Governance & Accountability

- 🔒 **Permission Control**: Role-based access, agents run with bounded authority
- 📜 **Audit Logs**: All AI operations traceable and reviewable
- ✋ **Human Approval**: Sensitive operations (publication, resource allocation) require confirmation
- 🔍 **Evidence Chain**: Complete justification record for every decision

## 🤖 AI Agent System

### Central Brain Workflow

```
User Request → Understand Intent → Load Context → Delegate to Sub-Agents →
Merge Results → Check Approval → Execute → Write Back → Return to User
```

### Specialized Sub-Agents

1. **Intake Agent** - Extract structure from messages, reports, meeting records
2. **Task Agent** - Break goals into tasks with owners, dates, dependencies
3. **Drafting Agent** - Draft notices, plans, summaries, briefings, reports
4. **Follow-up Agent** - Track deadlines, delays, blockages, missing responses
5. **Summary Agent** - Combine multi-source updates into daily/weekly summaries
6. **Risk Agent** - Detect warning signals, repeated failures, unusual delays
7. **Review Agent** - Prepare review packs, checklists, rectification items
8. **Governance Guard Agent** - Check permissions, publication rules, approval requirements

### Automation Policy

- ✅ **Auto Execute**: Summarization, classification, clustering, drafting, reminders, task creation
- ⚠️ **Auto Execute + Audit**: Priority changes, cross-module tasks, risk tagging
- 🛑 **Human Confirmation Required**: External publication, budget changes, permission changes, deletions

## 📁 Project Structure

```
OpenPolis/
├── apps/web/              # Next.js 15 Web Application
├── packages/
│   ├── contracts/         # Domain contracts and DTOs
│   ├── domain/            # Core business logic
│   ├── application/       # Application service layer
│   ├── db/                # Database adapters (SQLite/Drizzle)
│   ├── runtime/           # Dependency injection composition root
│   ├── governance/        # Policy and permission rules
│   ├── i18n/              # Internationalization (en, zh-CN)
│   └── ui/                # Shared UI components
├── docs/
│   ├── adr/               # Architecture Decision Records
│   └── plans/             # System design documents
└── scripts/               # Build and maintenance scripts
```

## 🛠️ Development Commands

```bash
pnpm dev          # Development mode with hot reload
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm typecheck    # TypeScript type checking
pnpm lint         # Code linting
```

## 🎓 Use Case Examples

### Example 1: Morning Briefing

```
User: "Give me today's key situation"

AI Processing:
1. Summary Agent aggregates overnight changes
2. Risk Agent detects delays and risks
3. Task Agent lists today's priorities

Output:
- 3 new feedback items to process
- 2 overdue tasks
- 1 risk signal (budget execution 15% behind)
- 5 priority tasks for today
```

### Example 2: Meeting to Tasks

```
User: Uploads meeting-notes.txt

AI Processing:
1. Intake Agent extracts decisions and action items
2. Task Agent creates tasks with assignments
3. Drafting Agent generates formatted meeting record

Output:
- 7 tasks created
- Assigned to 4 team members
- Formatted meeting minutes generated
- Reminders sent automatically
```

## 🔐 Security & Privacy

- 🔒 **Data Isolation**: Workspace data completely isolated
- 🔑 **Encrypted Storage**: Sensitive fields encrypted
- 📝 **Audit Logs**: Operations immutably recorded
- 🚫 **No Surveillance**: No user behavior tracking, no political scoring
- ✅ **Open Source**: Code is public and auditable

## 🌍 Internationalization

- 🇬🇧 English - Full support
- 🇨🇳 Simplified Chinese - Full support
- 🌐 Other languages - Contributions welcome

## 🤝 Contributing

We welcome all forms of contribution!

1. Fork the project
2. Create branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add feature"`
4. Push branch: `git push origin feature/your-feature`
5. Create Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- **OGAS Research** - Cybernetic principles
- **GovStack** - Digital public infrastructure architecture
- **UNDP** - Digital governance guidelines

## 📞 Contact & Support

- 🐛 [Report Bug](https://github.com/aigclist/OpenPolis/issues)
- 💡 [Feature Request](https://github.com/aigclist/OpenPolis/discussions)
- 📖 [Documentation](./docs/)

---

<div align="center">

**OpenPolis** - Empowering every organization with efficient digital governance 🚀

Made with ❤️ by the OpenPolis community

</div>
