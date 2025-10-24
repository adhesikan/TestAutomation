# Design Guidelines: Automated Testing Dashboard for AlgoPilotX

## Design Approach

**Selected System**: Material Design with modern dashboard patterns
**Justification**: Testing dashboards require clear information hierarchy, excellent data visualization, and professional reliability. Material Design provides robust patterns for data-dense interfaces while maintaining visual appeal.

**Key References**: Linear (for clean UI), Vercel Dashboard (for deployment/testing displays), Datadog (for monitoring interfaces)

**Design Principles**:
- Clarity over decoration: Every element serves a functional purpose
- Scannable information: Test results visible at a glance
- Progressive disclosure: Detailed logs available on demand
- Status-driven design: Visual indicators for pass/fail/running states

## Typography System

**Font Stack**: Inter (primary), JetBrains Mono (code/logs)

**Hierarchy**:
- Page Titles: text-3xl font-bold (Dashboard, Test Suites, Reports)
- Section Headers: text-xl font-semibold (Test Categories, Recent Runs)
- Card Titles: text-lg font-medium (Individual test names)
- Body Text: text-base font-normal (Descriptions, metadata)
- Data Labels: text-sm font-medium (Status labels, timestamps)
- Code/Logs: text-sm font-mono (Stack traces, API responses)
- Captions: text-xs (Helper text, footnotes)

## Layout System

**Spacing Units**: Tailwind 2, 3, 4, 6, 8, 12, 16 for consistent rhythm

**Container Structure**:
- Max-width: max-w-7xl for main dashboard content
- Page padding: px-4 md:px-6 lg:px-8
- Section spacing: space-y-6 to space-y-8
- Card padding: p-4 md:p-6
- Grid gaps: gap-4 for cards, gap-2 for compact lists

**Responsive Grid**:
- Test cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Metrics display: grid-cols-2 md:grid-cols-4
- Single column for detailed test results

## Component Library

### Navigation
**Top Navigation Bar**:
- Full-width sticky header with logo left, user menu right
- Height: h-16, includes shadow-sm for separation
- Navigation links: Dashboard, Test Suites, Scheduled Runs, Settings

**Sidebar** (optional for larger screens):
- Fixed left sidebar w-64 on lg+
- Collapsible test suite categories
- Quick access to recent test runs

### Core Dashboard Components

**Metrics Cards**:
- 4-column grid showing: Total Tests, Pass Rate, Failed Tests, Avg Duration
- Large numbers (text-4xl font-bold) with labels beneath
- Icon indicators for each metric type

**Test Status Cards**:
- Prominent status badge (running/passed/failed) at top
- Test name as card title
- Metadata row: duration, timestamp, browser/environment
- Expandable details section for logs/screenshots
- Action buttons: Rerun, View Details, Download Report

**Test Results Table**:
- Sortable columns: Test Name, Status, Duration, Timestamp, Actions
- Row hover states for interactivity
- Inline status indicators with clear visual differentiation
- Expandable rows for detailed logs

**Real-Time Test Runner Display**:
- Progress bar showing current test execution
- Live log feed with auto-scroll
- Current step indicator
- Pause/Stop controls

**Calendar/Schedule View**:
- Monthly calendar grid for scheduled test runs
- Day cells showing scheduled test count
- Click to view/edit scheduled tests

### Forms & Configuration

**Test Configuration Panel**:
- Grouped form sections with clear labels
- Input groups for URL, selectors, assertions
- Dropdown for browser/device selection
- Toggle switches for options (screenshots on fail, headless mode)
- JSON editor for advanced configuration

**Schedule Creator**:
- Time picker for test execution
- Frequency selector (hourly, daily, weekly)
- Notification preferences checkboxes

### Data Visualization

**Pass/Fail Charts**:
- Line graph showing test success rate over time
- Bar charts for test duration trends
- Donut chart for overall pass/fail distribution

**Test Coverage Map**:
- Visual representation of tested endpoints/features
- Progress bars for coverage percentages

### Overlays & Modals

**Test Detail Modal**:
- Full-screen overlay for detailed test results
- Tabbed interface: Overview, Logs, Screenshots, Network
- Screenshot carousel for visual regression
- Syntax-highlighted code blocks for requests/responses

**Confirmation Dialogs**:
- Standard centered modals for delete/rerun confirmations
- Clear primary/secondary action buttons

## Status Indicators

**Visual Language**:
- Passed: Checkmark icon, subtle positive treatment
- Failed: X icon, attention-grabbing treatment
- Running: Animated spinner, in-progress indication
- Scheduled: Clock icon, neutral treatment
- Skipped: Dash icon, muted treatment

**Implementation**: Use badges/pills with icon + text, consistent sizing (h-6 to h-8)

## Interactive Elements

**Buttons**:
- Primary: Solid style for main actions (Run Tests, Save Config)
- Secondary: Outlined style for secondary actions (Cancel, View Details)
- Danger: Destructive actions (Delete Test, Clear Data)
- Icon buttons: Square, consistent sizing for table actions

**Hover States**: Subtle opacity shifts and pointer cursors

## Page Layouts

### Dashboard (Main)
- Header with quick stats (4-column metrics)
- Recent test runs section (card grid)
- Test execution timeline
- Quick actions panel

### Test Suites
- List view of all test suites
- Create new suite button prominent
- Filter/search bar
- Bulk action controls

### Individual Test Details
- Breadcrumb navigation
- Test metadata header
- Execution history timeline
- Configuration panel (collapsible)
- Full logs with search functionality

### Reports
- Date range selector
- Export controls (PDF, CSV)
- Comprehensive charts and statistics
- Downloadable artifacts section

## Accessibility
- Proper heading hierarchy throughout
- ARIA labels for status indicators
- Keyboard navigation for all interactive elements
- Focus visible states on all controls
- Screen reader announcements for test status changes