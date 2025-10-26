# AlgoPilotX Test Monitor

## Overview

AlgoPilotX Test Monitor is an automated testing dashboard for monitoring and executing browser-based tests against `app.algopilotx.com`. It provides real-time test execution, scheduling capabilities, and comprehensive test result tracking with visual analytics. The system uses Playwright for browser automation across Chromium, Firefox, and WebKit, allowing custom scripts, cron-scheduled tests, and real-time monitoring via WebSockets. The project is fully operational with complete frontend-backend integration and persists all data in a PostgreSQL database, with a dark mode as the default theme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript (Vite).
**UI/UX**: Radix UI primitives with shadcn/ui styling, following Material Design principles ("new-york" style variant). Emphasizes clarity and scannability for data-dense dashboards.
**Typography**: Inter (UI) and JetBrains Mono (code/logs), with a structured hierarchy.
**State Management**: TanStack Query (React Query) for server state; WebSocket client for real-time updates.
**Routing**: Wouter for client-side routing (Dashboard, Test Suites, Test Runner, Settings).
**Styling**: Tailwind CSS with custom design tokens for theming (dark mode default, light mode support).
**Real-time Updates**: WebSocket connection to `/ws` for test execution logs, progress, and completion.

### Backend Architecture

**Runtime**: Node.js with Express server (TypeScript, ES modules).
**API Structure**: RESTful API under `/api` for tests, test runs, schedules, and stats.
**WebSocket Server**: `ws` library integrated with HTTP server on `/ws` for real-time test execution communication (event-driven architecture).
**Test Execution**: Playwright-based executor (`server/test-executor.ts`) supporting multiple browsers (Chromium, Firefox, WebKit), headless/headed modes, screenshot capture on failures, and simple script commands (click, type, wait, expect, goto).
**Scheduler**: `node-cron` based system (`server/scheduler.ts`) for managing scheduled test runs with cron expression validation.
**Storage Interface**: Abstract `IStorage` interface, implemented with PostgreSQL.

### Data Storage Solutions

**Database**: PostgreSQL with Drizzle ORM.
**Schema**: Defined in `shared/schema.ts`, includes `tests`, `test_runs`, `schedules`, and `users` (reserved).
**Connection**: Via `DATABASE_URL` environment variable using `@neondatabase/serverless` driver. Migrations handled by `npm run db:push`.
**Screenshot Storage**: Failure screenshots are captured as base64 strings and stored directly in `test_runs.screenshot` column.

### Test Script Language

Supports a simple command-based scripting language for browser automation: `click <selector>`, `type <selector> "text"`, `wait <milliseconds>`, `expect <selector>`, `goto <url>`. Includes a Playwright parser to convert Codegen output to this simple format.

## External Dependencies

**Browser Automation**: Playwright library.
**Scheduling**: `node-cron`.
**Database**: Drizzle ORM, `@neondatabase/serverless` (PostgreSQL), `connect-pg-simple`.
**UI Component Libraries**: `@radix-ui/*`, Recharts, Lucide React.
**WebSocket**: `ws` library.
**Utilities**: `date-fns`, `zod`, `class-variance-authority`, `clsx`.