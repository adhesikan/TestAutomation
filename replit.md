# AlgoPilotX Test Monitor

## Overview

AlgoPilotX Test Monitor is a fully functional automated testing dashboard for monitoring and executing browser-based tests against app.algopilotx.com. The application provides real-time test execution, scheduling capabilities, and comprehensive test result tracking with visual analytics.

The system uses Playwright for browser automation, supporting Chromium, Firefox, and WebKit browsers. Tests can be configured with custom scripts, scheduled using cron expressions, and monitored in real-time through WebSocket connections.

**Current Status**: Fully implemented and operational with complete frontend-backend integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: Radix UI primitives with shadcn/ui styling patterns following Material Design principles with the "new-york" style variant. The design emphasizes clarity, scannability, and status-driven interfaces suitable for data-dense testing dashboards.

**Typography**: Inter font for UI elements and JetBrains Mono for code/logs, with a structured hierarchy from page titles (text-3xl) down to captions (text-xs).

**State Management**: TanStack Query (React Query) for server state management with custom query client configured for API requests. WebSocket client for real-time test execution updates.

**Routing**: Wouter for lightweight client-side routing with pages for Dashboard, Test Suites, Test Runner, and Settings.

**Styling**: Tailwind CSS with custom design tokens for theming (light/dark mode support). Uses CSS variables for colors with HSL values and includes custom spacing units, border radius values, and elevation patterns.

**Real-time Updates**: WebSocket connection to `/ws` endpoint for receiving test execution logs, progress updates, and completion notifications. Custom WebSocket client (`client/src/lib/websocket.ts`) handles reconnection logic and event distribution.

### Backend Architecture

**Runtime**: Node.js with Express server

**Language**: TypeScript with ES modules

**API Structure**: RESTful API endpoints under `/api` prefix:
- `/api/tests` - CRUD operations for test configurations
- `/api/test-runs` - Test execution history and results
- `/api/schedules` - Test scheduling management with cron validation
- `/api/stats` - Dashboard statistics and metrics

**WebSocket Server**: ws library integrated with HTTP server on `/ws` path for real-time test execution communication using event-driven architecture. Broadcasts log, progress, and completion events to connected clients.

**Test Execution**: Playwright-based test executor (`server/test-executor.ts`) running browser automation with support for:
- Multiple browsers (Chromium, Firefox, WebKit)
- Headless/headed modes
- Screenshot capture on failures
- Progress tracking and logging
- Asynchronous execution with event emitters
- Simple script commands: click, type, wait, expect, goto

**Scheduler**: node-cron based scheduling system (`server/scheduler.ts`) that validates cron expressions and manages scheduled test runs. Initializes on server startup with persisted schedules. Validates cron expressions before creating/updating schedules to prevent invalid entries.

**Storage Interface**: Abstract `IStorage` interface with in-memory implementation (`MemStorage`) for rapid prototyping. All data operations go through this interface for tests, test runs, and schedules. Ready for migration to persistent database when needed.

### Data Storage Solutions

**Current Implementation**: In-memory storage using Map structures for development and testing.

**Schema Definition**: Drizzle ORM schema defined in `shared/schema.ts` with PostgreSQL dialect configuration:

- `tests` table - Test configurations (name, URL, browser, headless mode, screenshot settings, test scripts)
- `test_runs` table - Execution history (status, duration, timestamps, logs, screenshots, errors)
- `schedules` table - Scheduled test runs (cron expressions, enabled state)

**Migration Path**: Drizzle Kit configured for PostgreSQL migrations. Database URL expected via `DATABASE_URL` environment variable. Can easily switch from MemStorage to database-backed storage.

### Test Script Language

Tests support a simple command-based scripting language:
- `click <selector>` - Click an element
- `type <selector> "text"` - Fill input field
- `wait <milliseconds>` - Wait for duration
- `expect <selector>` - Wait for element to appear
- `goto <url>` - Navigate to URL

### External Dependencies

**Browser Automation**: Playwright library for cross-browser testing with support for Chromium, Firefox, and WebKit engines.

**Scheduling**: node-cron for cron-based test scheduling with expression validation

**Database**: 
- Drizzle ORM as the database toolkit
- @neondatabase/serverless for PostgreSQL connection (when database is created)
- connect-pg-simple for PostgreSQL session store (for future authentication)

**UI Component Libraries**:
- @radix-ui/* components (18+ component packages) for accessible UI primitives
- Recharts for data visualization (line charts, cartesian grids)
- Lucide React for icons

**WebSocket**: ws library for real-time communication

**Utilities**:
- date-fns for date manipulation
- zod for schema validation
- class-variance-authority and clsx for conditional styling

**Development Tools**:
- @replit/vite-plugin-runtime-error-modal for error overlays
- esbuild for server bundling

## Recent Changes (October 24, 2025)

**Complete Implementation**:
- ✅ Defined comprehensive data models for tests, test runs, and schedules
- ✅ Implemented full storage interface with in-memory backing
- ✅ Created Playwright-based test executor with script parsing
- ✅ Built RESTful API routes for all CRUD operations
- ✅ Integrated WebSocket for real-time test execution updates
- ✅ Connected frontend to backend APIs, removed all mock data
- ✅ Implemented cron-based test scheduling with validation
- ✅ Fixed critical schedule management bugs (cron validation, enable/disable toggle)

**Key Features Delivered**:
1. Dashboard with real-time metrics and test history
2. Test suite management (create, run, delete tests)
3. Live test runner with WebSocket-powered log streaming
4. Configurable test scripts with browser automation
5. Schedule management with cron expression validation
6. Dark mode support throughout the application
7. Comprehensive error handling and user feedback

## Architecture Decisions

**Why In-Memory Storage**: Chosen for rapid development and easy deployment. Can be replaced with PostgreSQL without changing application logic thanks to the storage interface abstraction.

**Why Playwright**: Cross-browser support, modern API, excellent documentation, and active maintenance. Better than Puppeteer for multi-browser testing scenarios.

**Why WebSocket**: Enables real-time streaming of test logs and progress updates, providing excellent user experience during test execution.

**Why Simple Script Language**: Easier for users to write and understand compared to raw Playwright code. Extensible design allows adding new commands as needed.

**Security Considerations**: 
- Cron expressions validated before scheduling to prevent malformed entries
- Test scripts run in isolated browser contexts
- WebSocket connections automatically cleaned up on disconnect
- API routes include error handling to prevent information leakage

## Future Enhancements

Potential improvements for future development:
- Migrate to PostgreSQL for persistent storage
- Add user authentication and multi-user support
- Implement visual regression testing with screenshot comparison
- Add performance metrics and load time monitoring
- Create comprehensive test coverage reports
- Email/Slack notifications for test failures
- CI/CD pipeline integration
- Test result history and trend analysis
- Advanced test script editor with syntax highlighting
