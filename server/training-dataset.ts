/**
 * Training dataset for AI test script generation
 * Format: Natural language instruction → DSL commands
 */

export const trainingExamples = [
  // LOGIN / AUTH WORKFLOWS
  {
    english: "Go to the login page and wait for it to load.",
    dsl: `goto https://staging.algopilotx.com
wait 1500`
  },
  {
    english: "Enter the email and click continue.",
    dsl: `expect input[type="email"]
type input[type="email"] "user@example.com"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000`
  },
  {
    english: "Now type the password and log in.",
    dsl: `expect input[type="password"]
type input[type="password"] "mypassword123"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 3000`
  },
  {
    english: "Log in using these credentials: email hello@test.com password abc123.",
    dsl: `expect input[type="email"]
type input[type="email"] "hello@test.com"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000
expect input[type="password"]
type input[type="password"] "abc123"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2500`
  },
  
  // BUTTONS & NAVIGATION
  {
    english: "Click the Create new automation button.",
    dsl: `expect text=Create new automation
click :has-text("Create new automation")
wait 1500`
  },
  {
    english: "Open the settings menu.",
    dsl: `expect text=Settings
click :has-text("Settings")
wait 1500`
  },
  {
    english: "Move to the Dashboard page.",
    dsl: `goto https://staging.algopilotx.com/dashboard
wait 2000`
  },
  {
    english: "Confirm the action.",
    dsl: `expect button:has-text("Confirm")
click button:has-text("Confirm")
wait 1500`
  },
  
  // FORM INPUTS
  {
    english: "Fill the ticker field with NVDA.",
    dsl: `expect input[placeholder="Ticker"]
type input[placeholder="Ticker"] "NVDA"
wait 500`
  },
  {
    english: "Enter quantity of 10 shares.",
    dsl: `expect input[type="number"]
type input[type="number"] "10"
wait 500`
  },
  {
    english: "Clear the field and type SPY.",
    dsl: `click input
press "Control+A"
press "Backspace"
type input "SPY"
wait 500`
  },
  
  // DROPDOWNS
  {
    english: "Select TradingView as the signal source.",
    dsl: `select :has-text("Source") "TradingView"
wait 1000`
  },
  {
    english: "Choose Stock as the equity type.",
    dsl: `select #apx-configure-equity-type-indicator "Stock"
wait 1000`
  },
  {
    english: "Set the order side to Buy to open.",
    dsl: `select #apx-configure-stock-side "Buy to open"
wait 1000`
  },
  
  // SCROLL / HOVER
  {
    english: "Scroll down the page.",
    dsl: `scroll 600`
  },
  {
    english: "Hover over the account menu.",
    dsl: `hover :has-text("Account")
wait 1000`
  },
  
  // COMBINED AUTOMATION CREATION FLOW (FULL)
  {
    english: "Create a new NVDA stock automation setup.",
    dsl: `goto https://staging.algopilotx.com
wait 2000
expect text=Create new automation
click :has-text("Create new automation")
wait 1500
select :has-text("Source") "TradingView"
wait 1000
expect input[placeholder="Ticker"]
type input[placeholder="Ticker"] "NVDA"
wait 500
select #apx-configure-equity-type-indicator "Stock"
wait 1000
select #apx-configure-stock-side "Buy to open"
wait 1000
expect input[type="number"]
type input[type="number"] "10"
wait 500
expect button:has-text("Create Automation")
click button:has-text("Create Automation")
wait 2000`
  }
];

/**
 * Generate few-shot examples for the AI prompt
 */
export function getFewShotExamples(count: number = 5): string {
  const examples = trainingExamples.slice(0, count);
  return examples.map(ex => `ENGLISH: ${ex.english}\n\nDSL:\n${ex.dsl}`).join('\n\n---\n\n');
}

/**
 * Get all training examples as a formatted string
 */
export function getAllExamples(): string {
  return trainingExamples.map((ex, i) => 
    `Example ${i + 1}:\nENGLISH: ${ex.english}\n\nDSL:\n${ex.dsl}`
  ).join('\n\n---\n\n');
}
