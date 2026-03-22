# Changelog

All notable changes to OpenPolis will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial monorepo structure with clean architecture
- Core domain models: Issues, Briefs, Tasks, Assets, Feedback, Reviews
- SQLite-based workspace storage with migration system
- Runtime composition root for dependency injection
- Governance policies: approval gates, retention, sensitive fields, object access
- Internationalization support (English, Chinese)
- Next.js 15 web application with React Server Components
- AI agent runtime foundation
- Comprehensive test suite for contracts, domain, application, and database layers

### Architecture
- Frontstage/backstage separation between web app and infrastructure
- Clean architecture with ports and adapters pattern
- Event sourcing for domain events
- Shared operational memory model for agent coordination

### Documentation
- Architecture Decision Records (ADR)
- System design documents for agent brain governance
- Dashboard command desk design
- AI control surface design

## [0.1.0] - 2026-03-19

### Added
- Initial project setup
- Basic monorepo structure
- Development environment configuration

---

**Note**: This project is in active development. Breaking changes may occur before v1.0.0.
