# InviteStory AI Production System

An AI-powered invitation production pipeline that transforms WhatsApp conversations and templates into browser-tested, customer-ready wedding invitation drafts.

## Architecture

```
invitestory-ai/
├── apps/
│   ├── api/                 # Cloudflare Worker API (Hono)
│   ├── internal-ui/         # React internal tool (Vite)
│   └── delivery-worker/     # Future: Public delivery worker
├── packages/
│   ├── contracts/           # Shared Zod schemas & types
│   ├── ingest/              # ZIP extraction, WhatsApp parsing
│   ├── extraction/          # Transcription, OCR, spec extraction
│   ├── templates/           # Template registry & adapters
│   ├── compiler/            # Deterministic compilation orchestrator
│   ├── agent-tasks/         # Scoped coding agent tasks
│   ├── sandbox/             # SandboxProvider (Cloudflare Sandbox)
│   ├── browser-qa/          # Playwright browser testing
│   ├── visual-qa/           # Visual comparison & AI review
│   └── model-router/        # Role-based model routing
├── templates/               # Template sources (read-only)
├── migrations/              # Database schemas
└── docs/                    # Documentation
```

## MVP Scope

- **One template** (Rajmahal) + **one historical order** end-to-end
- Internal form-based UI: Upload → Spec Review → Build → QA → Approve
- No ERP integration, GitHub repo creation, or auto-publishing
- Designers remain final reviewers (₹100/order minimum preserved)

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Cloudflare Wrangler CLI (`npm i -g wrangler`)

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
# Terminal 1: Start API (Cloudflare Worker)
cd apps/api && pnpm dev

# Terminal 2: Start Internal UI
cd apps/internal-ui && pnpm dev
```

API runs on http://localhost:8787
UI runs on http://localhost:3000 (proxies /v1 to API)

### Database Setup

```bash
cd apps/api
pnpm db:push  # Creates local D1 database with schema
```

## MVP Flow

1. **Upload** (`/new`) - Select template, upload WhatsApp ZIP
2. **Analyze** - Safe extraction, parsing, transcription, OCR, spec generation
3. **Review Spec** (`/jobs/:id/spec`) - Edit extracted requirements, resolve uncertainties
4. **Build** - Isolated sandbox, deterministic template adapter, agent tasks for custom work
5. **QA** - Playwright browser test (mobile/desktop), factual checks, visual comparison
6. **Review** (`/jobs/:id/review`) - Preview, screenshots, issues, approve/repair/escalate

## Key Commands

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Lint all
pnpm lint

# Typecheck all
pnpm typecheck
```

## Configuration

- `apps/api/wrangler.toml` - Cloudflare Worker config (D1, R2 bindings)
- `packages/contracts/src/index.ts` - Core type definitions
- `packages/templates/src/registry.ts` - Template capability manifests

## MVP Acceptance Criteria

- One real historical WhatsApp ZIP + Rajmahal template → customer-ready draft
- Editable spec with evidence-linked fields
- Isolated sandbox build with Playwright QA
- Factual verification (names, dates, venues, URLs)
- Visual comparison against baseline
- Human approval workflow

## Documentation

- `docs/architecture.md` - System architecture details
- `docs/mvp-plan.md` - Implementation plan
- `docs/contracts.md` - Data contracts reference

## License

Private - InviteStory Internal Use Only