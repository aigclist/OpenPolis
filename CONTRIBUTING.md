# Contributing to OpenPolis

Thank you for your interest in contributing to OpenPolis! This project aims to provide digital governance infrastructure for resource-constrained organizations worldwide. Every contribution matters.

## How to Contribute

### Reporting Issues

- Use GitHub Issues to report bugs or request features
- Search existing issues before creating a new one
- Provide clear reproduction steps for bugs
- Include relevant environment information (OS, Node.js version, browser)

### Submitting Changes

1. **Fork** the repository
2. **Create a branch** from `main` for your changes
3. **Write clear commit messages** that explain the "why"
4. **Add tests** for new features or bug fixes
5. **Run all checks** before submitting:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```
6. **Submit a pull request** with a clear description

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/OpenPolis.git
cd OpenPolis

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Start development server
pnpm dev
```

### Project Structure

The project is a pnpm monorepo:

- `apps/web` — Next.js web application
- `packages/contracts` — Domain contracts and shared types
- `packages/domain` — Core business logic
- `packages/application` — Application services and ports
- `packages/db` — Database adapters (SQLite/Drizzle)
- `packages/runtime` — Composition root for server-side consumers
- `packages/governance` — Policy and permission rules
- `packages/i18n` — Internationalization (English, Chinese)
- `packages/ui` — Shared UI components

### Coding Standards

- **TypeScript**: All code must be typed. No `any` unless absolutely necessary.
- **Architecture**: Follow the existing clean architecture boundaries. Web app must not import `@openpolis/db` directly — use `@openpolis/runtime`.
- **Naming**: Use plain language. Prefer `PriorityItem` over `GovernanceEntity`.
- **Tests**: Write tests for business logic and critical paths.
- **i18n**: All user-facing strings should use the i18n system.

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add task follow-up reminder workflow
fix: correct permission check for approval gates
docs: update architecture decision record for runtime
refactor: extract dashboard snapshot into separate module
```

### Pull Request Guidelines

- Keep PRs focused on a single concern
- Reference related issues
- Include a summary of what changed and why
- Add screenshots for UI changes
- Ensure all CI checks pass

## Internationalization

OpenPolis targets global adoption. When adding user-facing text:

1. Add strings to `packages/i18n/messages/en.json`
2. Add corresponding translations to `packages/i18n/messages/zh-CN.json`
3. Use the i18n hooks/functions in components

## Areas Where Help Is Needed

- **Translations**: Adding more languages
- **Documentation**: Improving guides and tutorials
- **Testing**: Increasing test coverage
- **Accessibility**: Ensuring the UI works for all users
- **Performance**: Optimizing for low-resource environments
- **Agent Development**: Building and improving specialized sub-agents
- **Deployment**: Simplifying setup for non-technical operators

## Questions?

If you have questions about contributing, open a GitHub Discussion or reach out through Issues.

Thank you for helping build digital infrastructure for civic organizations worldwide.
