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

Supports a simple command-based scripting language for browser automation: `goto <url>`, `click <selector>`, `type <selector> "text"`, `select <selector> "option"`, `wait <milliseconds>`, `expect <selector>`. Includes a Playwright parser to convert Codegen output to this simple format.

## External Dependencies

**Browser Automation**: Playwright library.
**AI Integration**: OpenAI API for test script generation.
**Scheduling**: `node-cron`.
**Database**: Drizzle ORM, `@neondatabase/serverless` (PostgreSQL), `connect-pg-simple`.
**UI Component Libraries**: `@radix-ui/*`, Recharts, Lucide React.
**WebSocket**: `ws` library.
**Utilities**: `date-fns`, `zod`, `class-variance-authority`, `clsx`.

## Recent Changes

### October 28, 2025 - Modal UX Improvements & Enhanced AI Generator

**Modal Size and Behavior Fixes**:
- Reduced modal width from `max-w-2xl` (672px) to `max-w-xl` (576px) to fit better in viewport
- Added `max-h-[85vh]` with `overflow-y-auto` - modal is now scrollable and fits within 85% of viewport height
- Prevented accidental closing: clicking outside the modal no longer closes it
- Modal can only be closed via Cancel button, Save button (on success), or ESC key
- Prevents data loss from accidental clicks outside the modal
- Applied to both Create Test and Edit Test modals

### October 28, 2025 - AI Training Dataset Integration & Enhancement

**AI Training Dataset Integration**:
- Integrated comprehensive training dataset with 16 proven examples covering:
  - Login/auth workflows (email + password flows)
  - Button clicks and navigation
  - Form inputs (text, numbers, placeholders)
  - Dropdown selections
  - Scroll and hover actions
  - Complex multi-step automation flows
- AI generator now uses these examples as few-shot learning data
- Significantly improved accuracy and consistency of generated scripts

**Dataset Enhancement System**:
- New API endpoint: `POST /api/enhance-dataset` to generate more training examples
- Uses OpenAI to create diverse, realistic browser automation scenarios
- Generates varied examples covering:
  - Login/logout workflows
  - Form submissions
  - Search functionality
  - E-commerce actions
  - Account management
  - Multi-step processes
- Returns JSON with new examples that can be added to training dataset

**Enhanced DSL Support**:
- Added scroll command: `scroll <pixels>`
- Added hover command: `hover <selector>`
- Added press command: `press "<key>"`
- Expanded selector rules for placeholders, labels, and IDs
- Improved wait time guidelines (500ms quick, 1500-2000ms major changes)

**Technical Implementation**:
- Created `server/training-dataset.ts` with structured training examples
- `getFewShotExamples()` function provides examples to AI prompt
- `enhanceTrainingDataset()` function uses OpenAI to generate more examples
- API: POST `/api/enhance-dataset` with configurable count parameter
- Training data now embedded directly in AI system prompt

### October 27, 2025 - AI-Powered Test Generator & Search Engine Blocking

**Initial AI-Powered Test Generator**:
- Integrated OpenAI API (gpt-4o-mini) for automatic test script generation from plain English descriptions
- Users describe what they want to test in natural language, AI generates the complete test script
- No browser popup or Playwright Codegen needed - completely cloud-based
- Three creation methods now available: AI Generator, Visual Builder, Raw Script
- AI Generator is the default tab for new tests

**User Workflow**:
1. Create new test and enter test name + target URL
2. AI Generator tab is selected by default
3. Describe test scenario in plain English (e.g., "Click login, enter username 'admin' and password 'test', submit, verify dashboard")
4. Click "Generate Test Script"
5. AI generates complete script automatically
6. Switch to Visual Builder or Raw Script to review/edit
7. Save and run test

**Search Engine Blocking**:
- Added `<meta name="robots" content="noindex, nofollow" />` to `client/index.html`
- Prevents all search engines from indexing any page on the site
- Ensures privacy for internal testing dashboard

### October 27, 2025 - Visual Script Builder

**Added Visual Script Builder Feature**:
- Created cloud-friendly visual test builder for creating tests without browser windows or Playwright locally
- Users build tests step-by-step using forms and dropdowns instead of writing code
- Supports 5 action types: Navigate to URL (goto), Click Element (click), Type Text (type), Wait (wait), Expect Element (expect)
- Step management: add, remove, reorder steps using intuitive UI
- Bidirectional sync between Visual Builder and Raw Script tabs
- Changes in visual builder immediately update raw script and vice versa

**Technical Implementation**:
- Component: `ScriptBuilder.tsx` with form-based step builder
- Integration: Added tabs to `TestConfigForm.tsx` - "AI Generator", "Visual Builder", and "Raw Script"
- Sync mechanism: Uses refs (`lastExternalValue`, `isInternalUpdate`) to distinguish external vs internal updates
- Helper functions: `parseScriptToSteps()` parses script into visual steps, `stepsToScript()` generates script from steps
- Prevents circular updates while maintaining perfect sync between views
- Works alongside AI Generator and "Import from Codegen" feature

**User Benefits**:
- No browser window needed - completely cloud-friendly for Railway deployment
- No local Playwright installation required
- Easier for non-technical users - visual interface vs code writing
- Prevents syntax errors in script generation
- Visual representation of test flow
- Can switch between visual and code views as needed

### October 27, 2025 - Real-time Status Updates Fix

**Fixed Test Suite Status Not Updating After Test Completion**:
- Added `refetchInterval: 3000` to TestRunStatus component for automatic polling every 3 seconds
- Enhanced WebSocket 'complete' event to include `testId` for targeted cache invalidation
- Added cache invalidation in TestRunner WebSocket handler for `/api/test-runs`, `/api/stats`, and specific test runs
- Test suite "Last Status" column now updates automatically without page refresh
- Works both via WebSocket (when on Test Runner page) and polling (when on Test Suites page)

**Technical Implementation**:
- Backend: Modified WebSocket `completeHandler` to fetch and include `testId` in complete event
- Frontend: Added `queryClient.invalidateQueries()` calls in TestRunner WebSocket handler
- Frontend: Added `refetchInterval: 3000` to TestRunStatus component as reliable fallback
- Result: Status updates within 3 seconds of test completion across all pages