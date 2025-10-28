# AlgoPilotX Test Monitor

## Overview

AlgoPilotX Test Monitor is an automated testing dashboard designed for monitoring and executing browser-based tests against `app.algopilotx.com`. It offers real-time test execution, scheduling, and comprehensive test result tracking with visual analytics. The system leverages Playwright for browser automation across Chromium, Firefox, and WebKit, supporting custom scripts, cron-scheduled tests, and real-time monitoring via WebSockets. It features full frontend-backend integration, persists data in a PostgreSQL database, and defaults to a dark mode theme. The project aims to provide a robust, user-friendly platform for efficient test automation and monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript using Vite. It utilizes Radix UI primitives and shadcn/ui styling, adhering to Material Design principles ("new-york" style) for clear, scannable data dashboards. Typography uses Inter for UI and JetBrains Mono for code/logs. State management is handled by TanStack Query for server state and a WebSocket client for real-time updates. Wouter manages client-side routing. Styling is implemented with Tailwind CSS and custom design tokens, with dark mode as the default. Real-time updates for test execution logs and progress are handled via a WebSocket connection to `/ws`.

### Backend Architecture

The backend is a Node.js application using Express (TypeScript, ES modules). It exposes a RESTful API under `/api` for managing tests, test runs, schedules, and statistics. A `ws` library-based WebSocket server is integrated at `/ws` for real-time test execution communication. Test execution is powered by a Playwright-based executor (`server/test-executor.ts`) supporting multiple browsers, headless/headed modes, screenshot capture on failures, and a simple command-based scripting language (`goto`, `click`, `type`, `select`, `wait`, `expect`). Test scheduling is managed by a `node-cron` based system (`server/scheduler.ts`). Data persistence uses an abstract `IStorage` interface implemented with PostgreSQL.

### Data Storage Solutions

The project uses PostgreSQL as its database, managed with Drizzle ORM. The schema, defined in `shared/schema.ts`, includes tables for `tests`, `test_runs`, `schedules`, and `users`. The database connects via a `DATABASE_URL` environment variable using the `@neondatabase/serverless` driver. Migrations are handled by `npm run db:push`. Failure screenshots are stored as base64 strings directly in the `test_runs.screenshot` column.

### Test Script Language

The system supports a simple, command-based scripting language for browser automation, including commands like `goto <url>`, `click <selector>`, `type <selector> "text"`, `select <selector> "option"`, `wait <milliseconds>`, and `expect <selector>`. It also includes a Playwright parser to convert Codegen output into this simplified format. The AI generator incorporates specific patterns for AlgoPilotX's login flow, strategy card selection using `nth=0`, and custom dropdown menu interactions via click-to-open/click-to-select.

## External Dependencies

-   **Browser Automation**: Playwright library
-   **AI Integration**: OpenAI API (for test script generation)
-   **Scheduling**: `node-cron`
-   **Database**: Drizzle ORM, `@neondatabase/serverless` (PostgreSQL driver), `connect-pg-simple`
-   **UI Components**: `@radix-ui/*`, Recharts, Lucide React
-   **WebSocket**: `ws` library
-   **Utilities**: `date-fns`, `zod`, `class-variance-authority`, `clsx`