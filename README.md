# OpenPolis

> A lightweight governance operating system for political organizations, local governments, and civic institutions

OpenPolis is an AI-powered governance platform designed to help resource-constrained organizations—small political parties, local governments, NGO coalitions, and public departments—operate more efficiently with less manual coordination work.

## Vision

Most political and civic organizations face a common challenge: they have ambitious goals but lack the digital infrastructure to execute effectively. OpenPolis addresses this by providing a unified control system that:

- Reduces repetitive administrative work through intelligent automation
- Maintains clear accountability and audit trails
- Supports low-resource settings with simple deployment
- Preserves human judgment for critical decisions

## Core Concept

OpenPolis is built around a **central agent brain** that coordinates specialized sub-agents to handle concrete operational work:

- **One unified interface** for all users
- **One central orchestrator** that receives goals and delegates work
- **Many specialized agents** that handle summarization, drafting, follow-up, and review
- **Shared operational memory** that keeps all agents aligned

The system is inspired by cybernetic principles from OGAS (All-State Automated System), adapted for modern democratic governance without surveillance or coercive control.

## Key Features

### Intelligent Workflow Automation
- Convert meeting notes into actionable tasks automatically
- Generate daily situation summaries from multiple data sources
- Track delays and send follow-up reminders
- Draft internal documents using approved templates

### Governance & Accountability
- Strong audit trails for all agent actions
- Human approval required for sensitive operations
- Role-based permissions and access control
- Traceability for every decision

### Modular Architecture
- **Priority Items**: Track major issues and campaigns
- **Action Plans**: Structure how priorities will be handled
- **Task Follow-up**: Monitor assigned work and deadlines
- **Materials & Outputs**: Manage reports, notices, and assets
- **Feedback**: Collect and analyze field reports
- **Inspection & Review**: Continuous improvement loops

## Technology Stack

- **Frontend**: Next.js 15+ with React Server Components
- **Backend**: TypeScript monorepo with clean architecture
- **Database**: SQLite (with migration path to PostgreSQL/D1)
- **AI**: Multi-agent orchestration system
- **Deployment**: Cloudflare-ready, low-resource optimized

## Project Structure

```
openpolis.org/
├── apps/
│   └── web/              # Next.js web application
├── packages/
│   ├── contracts/        # Domain contracts and DTOs
│   ├── domain/           # Core business logic
│   ├── application/      # Application services
│   ├── db/              # Database adapters
│   ├── runtime/         # Composition root
│   ├── governance/      # Policy and permission rules
│   ├── i18n/            # Internationalization
│   └── ui/              # Shared UI components
└── docs/                # Architecture and design docs
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/aigclist/OpenPolis.git
cd OpenPolis

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

### Running Tests

```bash
pnpm test
```

### Type Checking

```bash
pnpm typecheck
```

## Architecture Principles

OpenPolis follows clean architecture with clear boundaries:

1. **Frontstage/Backstage Separation**: Web app coordinates requests but doesn't directly depend on infrastructure
2. **Composition Root**: Runtime package composes services from adapters
3. **Domain-Driven Design**: Core business logic isolated from technical concerns
4. **Event Sourcing**: Important state changes captured as domain events

See [docs/adr/](./docs/adr/) for architectural decision records.

## Target Users

OpenPolis is designed for every role in an operating organization:

- Senior leaders and decision-makers
- Chiefs of staff and coordinators
- Political organizers and field staff
- Communications teams
- Operations and administrative staff
- Local office workers

The system works equally well for national administrations, provincial governments, city councils, autonomous authorities, and medium-sized political organizations.

## Design Principles

- Use plain language before technical jargon
- Reduce human writing, sorting, and chasing work
- Keep one public-facing interface
- Preserve human approval for sensitive actions
- Support low-resource settings
- Maintain strong audit trails

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- Inspired by cybernetic principles from OGAS research
- Built on GovStack architecture patterns
- Aligned with UNDP Digital Public Infrastructure guidelines

## Links

- Documentation: [docs/](./docs/)
- Architecture Decisions: [docs/adr/](./docs/adr/)
- Design Plans: [docs/plans/](./docs/plans/)

---

**Note**: OpenPolis is in active development. The system is evolving from a modular workflow application into a full governance operating system with AI orchestration.
