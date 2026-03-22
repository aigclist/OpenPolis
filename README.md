# OpenPolis

> 面向全球中小型政党、地方政府和公民组织的轻量级治理操作系统
> A lightweight governance operating system for political organizations, local governments, and civic institutions worldwide

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/aigclist/OpenPolis/workflows/CI/badge.svg)](https://github.com/aigclist/OpenPolis/actions)

---

## 🎯 这是什么？ | What is this?

OpenPolis 是一个 **AI 驱动的治理平台**，专为资源有限的组织设计：

- 🏛️ **小型政党** - 管理竞选活动、政策制定、成员协调
- 🏙️ **地方政府** - 处理公共事务、项目跟进、民意反馈
- 🤝 **NGO 组织** - 协调志愿者、管理项目、追踪影响力
- 📋 **公共部门** - 简化行政流程、提高响应速度

**核心理念**：用一个中央 AI 大脑协调多个专业子代理，自动处理重复性工作，让人类专注于需要判断力的决策。

---

## ⚡ 快速开始 | Quick Start

### 前置要求 | Prerequisites

确保你的电脑已安装：

- **Node.js** 18 或更高版本 → [下载地址](https://nodejs.org/)
- **pnpm** 包管理器 → 安装命令：`npm install -g pnpm`

### 5 分钟安装 | 5-Minute Setup

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

---

## 📖 详细安装指南 | Detailed Installation Guide

### Windows 用户

1. **安装 Node.js**
   - 访问 https://nodejs.org/
   - 下载 LTS 版本（推荐 18.x 或 20.x）
   - 运行安装程序，保持默认选项

2. **安装 pnpm**
   ```powershell
   # 打开 PowerShell 或 CMD
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

### macOS / Linux 用户

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

---

## 🚀 部署到生产环境 | Production Deployment

### 方式 1：Cloudflare Pages（推荐）

OpenPolis 针对 Cloudflare 进行了优化，部署简单且免费：

1. **准备构建**
   ```bash
   pnpm build
   ```

2. **连接到 Cloudflare**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 Pages → 创建项目
   - 连接你的 GitHub 仓库
   - 构建设置：
     - 构建命令：`pnpm build`
     - 输出目录：`apps/web/.next`
     - Node 版本：18 或 20

3. **配置环境变量**
   - 在 Cloudflare Pages 设置中添加环境变量
   - 复制 `.env.example` 中的所有变量

4. **部署**
   - 推送代码到 GitHub，Cloudflare 会自动构建和部署

### 方式 2：Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel
```

### 方式 3：Docker（即将支持）

```bash
# 构建镜像
docker build -t openpolis .

# 运行容器
docker run -p 3000:3000 --env-file .env openpolis
```

### 方式 4：传统服务器

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

---

## 🧠 核心功能 | Core Features

### 1. AI 中央大脑 | Central AI Brain

一个统一的 AI 控制台，理解你的需求并自动分配给专业子代理：

- 📝 **会议转任务**：上传会议记录，自动提取行动项和责任人
- 📊 **每日简报**：汇总过夜变化、延迟事项、风险信号
- ✍️ **文档起草**：根据模板和历史记录自动生成内部文件
- 🔔 **延迟追踪**：自动发现逾期任务并发送提醒

### 2. 模块化工作流 | Modular Workflows

```
┌─────────────────────────────────────────────────┐
│  优先事项 (Priority Items)                       │
│  追踪重大议题、活动、项目                         │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│  行动计划 (Action Plans)                         │
│  结构化的执行方案和阶段划分                       │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│  任务跟进 (Task Follow-up)                       │
│  分配工作、设置截止日期、监控进度                 │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│  材料输出 (Materials & Outputs)                  │
│  管理报告、通知、资产、文档                       │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│  反馈收集 (Feedback)                             │
│  汇总现场报告、公众意见、问题反馈                 │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│  检查复盘 (Inspection & Review)                  │
│  持续改进、经验总结、纠正措施                     │
└─────────────────────────────────────────────────┘
```

### 3. 治理与问责 | Governance & Accountability

- 🔒 **权限控制**：基于角色的访问控制，代理在有限权限下运行
- 📜 **审计日志**：所有 AI 操作可追溯、可审查
- ✋ **人工批准**：敏感操作（发布、资源分配）需要人工确认
- 🔍 **证据链**：每个决策都有完整的依据记录

---

## 📁 项目结构 | Project Structure

```
OpenPolis/
├── apps/
│   └── web/                    # Next.js 15 Web 应用
│       ├── src/
│       │   ├── app/           # 路由和页面
│       │   ├── components/    # React 组件
│       │   └── lib/           # 工具函数
│       ├── content/           # MDX 文档内容
│       └── tests/             # 集成测试
│
├── packages/
│   ├── contracts/             # 领域契约和 DTO
│   ├── domain/                # 核心业务逻辑
│   ├── application/           # 应用服务层
│   ├── db/                    # 数据库适配器（SQLite/Drizzle）
│   ├── runtime/               # 依赖注入组合根
│   ├── governance/            # 策略和权限规则
│   ├── i18n/                  # 国际化（中英文）
│   └── ui/                    # 共享 UI 组件
│
├── docs/
│   ├── adr/                   # 架构决策记录
│   └── plans/                 # 系统设计文档
│
├── scripts/                   # 构建和维护脚本
├── .github/                   # GitHub 配置和 CI/CD
├── .env.example               # 环境变量模板
├── package.json               # 根项目配置
└── pnpm-workspace.yaml        # Monorepo 工作区配置
```

---

## 🛠️ 开发命令 | Development Commands

```bash
# 开发模式（热重载）
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 依赖审计
pnpm deps:audit
```

---

## 🌍 国际化 | Internationalization

OpenPolis 支持多语言：

- 🇬🇧 **English** - 完整支持
- 🇨🇳 **简体中文** - 完整支持
- 🌐 **其他语言** - 欢迎贡献翻译！

添加新语言：

1. 复制 `packages/i18n/messages/en.json`
2. 翻译所有字符串
3. 在 `packages/i18n/src/config.ts` 中注册新语言
4. 提交 Pull Request

---

## 🏗️ 架构原则 | Architecture Principles

OpenPolis 遵循清晰的架构边界：

### 1. 前后台分离 | Frontstage/Backstage Separation
- Web 应用协调请求，但不直接依赖基础设施
- 通过 `@openpolis/runtime` 访问服务，而非直接导入 `@openpolis/db`

### 2. 领域驱动设计 | Domain-Driven Design
- 核心业务逻辑与技术实现隔离
- 清晰的领域模型：Issue、Brief、Task、Asset、Feedback、Review

### 3. 端口与适配器 | Ports & Adapters
- 应用层定义端口（接口）
- 基础设施层提供适配器（实现）
- 易于切换数据库（SQLite → PostgreSQL → Cloudflare D1）

### 4. 事件溯源 | Event Sourcing
- 重要状态变更记录为领域事件
- 支持审计、回滚、时间旅行调试

---

## 🤖 AI 代理系统 | AI Agent System

### 中央大脑 | Central Brain

统一入口，理解意图并协调子代理：

```
用户请求 → 中央大脑 → 分类任务 → 调用子代理 → 合并结果 → 返回用户
```

### 专业子代理 | Specialized Sub-Agents

1. **Intake Agent** - 读取消息、报告、会议记录，提取结构
2. **Task Agent** - 将目标分解为任务、责任人、截止日期
3. **Drafting Agent** - 起草通知、计划、简报、报告
4. **Follow-up Agent** - 追踪截止日期、延迟、阻塞
5. **Summary Agent** - 汇总多源更新为每日/每周摘要
6. **Risk Agent** - 检测警告信号、重复失败、异常延迟
7. **Review Agent** - 准备检查包、纠正清单、跟进记录
8. **Governance Guard Agent** - 检查权限、发布规则、批准要求

### 自动化策略 | Automation Policy

- ✅ **自动执行**：摘要、分类、聚类、起草、提醒、任务创建
- ⚠️ **自动执行+审计**：优先级变更、跨模块任务、风险标记
- 🛑 **需要人工确认**：外部发布、预算调整、权限变更、删除操作

---

## 🎓 使用场景示例 | Use Case Examples

### 场景 1：每日晨会简报

```
用户：给我今天的关键情况

AI 大脑：
1. 调用 Summary Agent 汇总过夜变化
2. 调用 Risk Agent 检测延迟和风险
3. 调用 Task Agent 列出今日待办

输出：
- 3 个新反馈需要处理
- 2 个任务逾期（市政项目审批、志愿者招募）
- 1 个风险信号（预算执行进度落后 15%）
- 今日 5 个优先任务
```

### 场景 2：会议转任务

```
用户：上传会议记录 meeting-notes.txt

AI 大脑：
1. Intake Agent 提取决策和行动项
2. Task Agent 创建任务并分配责任人
3. Drafting Agent 生成会议纪要

输出：
- 创建了 7 个任务
- 分配给 4 个团队成员
- 生成了格式化的会议纪要
- 自动发送提醒给相关人员
```

### 场景 3：延迟追踪

```
用户：检查有什么卡住了

AI 大脑：
1. Follow-up Agent 扫描所有逾期任务
2. 分析阻塞原因（等待批准、缺少资源、依赖未完成）
3. 生成跟进清单

输出：
- 12 个逾期任务
- 5 个等待外部批准
- 3 个缺少预算
- 自动生成催办消息草稿
```

---

## 🔐 安全与隐私 | Security & Privacy

- 🔒 **数据隔离**：工作区数据完全隔离
- 🔑 **加密存储**：敏感字段加密存储
- 📝 **审计日志**：所有操作不可篡改的记录
- 🚫 **无监控**：不收集用户行为数据，不进行政治评分
- ✅ **开源透明**：代码公开，可自行审计

---

## 🤝 贡献指南 | Contributing

我们欢迎各种形式的贡献！

### 如何贡献

1. **Fork 项目** → 点击右上角 Fork 按钮
2. **创建分支** → `git checkout -b feature/your-feature`
3. **提交更改** → `git commit -m "feat: add amazing feature"`
4. **推送分支** → `git push origin feature/your-feature`
5. **创建 PR** → 在 GitHub 上创建 Pull Request

### 贡献方向

- 🌐 **翻译**：添加新语言支持
- 📚 **文档**：改进安装指南、使用教程
- 🐛 **Bug 修复**：报告或修复问题
- ✨ **新功能**：提出或实现新特性
- 🧪 **测试**：增加测试覆盖率
- ♿ **无障碍**：改进可访问性

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 许可证 | License

MIT License - 详见 [LICENSE](./LICENSE)

这意味着你可以：
- ✅ 商业使用
- ✅ 修改代码
- ✅ 分发
- ✅ 私有使用

唯一要求：保留版权声明

---

## 🙏 致谢 | Acknowledgments

- **OGAS 研究**：借鉴控制论原理，但去除了集权和监控元素
- **GovStack**：遵循数字公共基础设施架构模式
- **UNDP**：对齐联合国开发计划署的数字治理指南
- **开源社区**：感谢所有贡献者和支持者

---

## 📞 联系与支持 | Contact & Support

- 🐛 **报告 Bug**：[GitHub Issues](https://github.com/aigclist/OpenPolis/issues)
- 💡 **功能建议**：[GitHub Discussions](https://github.com/aigclist/OpenPolis/discussions)
- 📖 **文档**：[docs/](./docs/)
- 🏗️ **架构决策**：[docs/adr/](./docs/adr/)
- 📋 **设计文档**：[docs/plans/](./docs/plans/)

---

## 🗺️ 路线图 | Roadmap

### 当前版本 v0.1.0（开发中）

- ✅ 核心架构和 Monorepo 结构
- ✅ 基础数据模型（Issue、Brief、Task、Asset、Feedback、Review）
- ✅ SQLite 数据库和迁移系统
- ✅ 治理策略（批准门、保留策略、敏感字段、对象访问）
- ✅ 国际化支持（中英文）
- 🚧 AI 代理运行时基础
- 🚧 Web 界面和用户体验

### v0.2.0（计划中）

- 🎯 中央 AI 控制台
- 🎯 会议转任务工作流
- 🎯 每日简报生成
- 🎯 延迟追踪和提醒

### v0.3.0（计划中）

- 🎯 文档起草工作流
- 🎯 反馈聚类和分析
- 🎯 模块级代理席位
- 🎯 完整审计日志

### v1.0.0（未来）

- 🎯 生产就绪
- 🎯 完整的自动化策略
- 🎯 可复用的操作模板
- 🎯 跨单位最佳实践传播

---

## ❓ 常见问题 | FAQ

### Q: OpenPolis 适合我的组织吗？

A: 如果你的组织符合以下特征，OpenPolis 很适合：
- 有明确的目标但缺少数字基础设施
- 需要协调多个团队或地点
- 花费大量时间在重复性行政工作上
- 需要清晰的问责和审计追踪
- 资源有限，无法负担昂贵的企业软件

### Q: 需要什么技术背景才能使用？

A: **不需要编程知识**！普通用户只需：
- 会使用浏览器
- 会上传文件
- 会用自然语言与 AI 对话

管理员需要基本的服务器部署知识（或使用 Cloudflare 一键部署）。

### Q: 数据存储在哪里？

A: 你可以选择：
- **自托管**：数据完全在你的服务器上
- **Cloudflare**：数据在 Cloudflare 的边缘网络
- **私有云**：部署到你的私有云环境

我们**不会**收集或存储你的数据。

### Q: 支持离线使用吗？

A: 当前版本需要网络连接。未来版本将支持：
- 离线模式（本地 SQLite）
- 弱网络环境优化
- 移动端优先设计

### Q: 如何确保 AI 不会做出错误决策？

A: 多层保护机制：
1. **人工批准**：敏感操作需要确认
2. **审计日志**：所有操作可追溯
3. **权限边界**：AI 在有限权限下运行
4. **回滚机制**：错误操作可以撤销

### Q: 与其他项目管理工具有什么区别？

A: OpenPolis 的独特之处：
- **专为治理设计**：不是通用项目管理工具
- **AI 优先**：中央大脑协调多个专业代理
- **低资源优化**：适合资源有限的组织
- **开源透明**：代码公开，可自行审计
- **无供应商锁定**：数据完全属于你

---

## 🌟 Star History

如果这个项目对你有帮助，请给我们一个 Star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=aigclist/OpenPolis&type=Date)](https://star-history.com/#aigclist/OpenPolis&Date)

---

**OpenPolis** - 让每个组织都能拥有高效的数字治理能力 🚀

Made with ❤️ by the OpenPolis community
