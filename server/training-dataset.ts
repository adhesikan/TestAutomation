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
wait 3000`
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
  
  // STRATEGY CARD SELECTION (always use nth=0)
  {
    english: "Select the Publisher-based strategy card.",
    dsl: `expect :has-text("Publisher-based strategy")
click :has-text("Publisher-based strategy") >> nth=0
wait 1500`
  },
  {
    english: "Choose Option Fundamentals Demo strategy.",
    dsl: `expect :has-text("Option Fundamentals Demo")
click :has-text("Option Fundamentals Demo") >> nth=0
wait 1500`
  },
  
  // CUSTOM DROPDOWN MENUS (click to open, click to select)
  {
    english: "Select strategy Breakout Signal from the dropdown.",
    dsl: `click :has-text("Select Strategy")
wait 500
click :has-text("Breakout Signal")
wait 1000`
  },
  {
    english: "Choose TradingView from the Source dropdown.",
    dsl: `click :has-text("Source")
wait 500
click :has-text("TradingView")
wait 1000`
  },
  {
    english: "Set equity type to Stock.",
    dsl: `click :has-text("Equity Type")
wait 500
click :has-text("Stock")
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
    english: "Create a new NVDA stock automation setup with Publisher-based strategy.",
    dsl: `goto https://staging.algopilotx.com
wait 2000
expect text=Create new automation
click :has-text("Create new automation")
wait 1500
expect :has-text("Publisher-based strategy")
click :has-text("Publisher-based strategy") >> nth=0
wait 1500
click :has-text("Configure Single Strategy")
wait 1000
click :has-text("Select Strategy")
wait 500
click :has-text("Breakout Signal")
wait 1000
expect input[placeholder="Ticker"]
type input[placeholder="Ticker"] "NVDA"
wait 500
click :has-text("Equity Type")
wait 500
click :has-text("Stock")
wait 1000
expect input[type="number"]
type input[type="number"] "10"
wait 500
expect button:has-text("Create Automation")
click button:has-text("Create Automation")
wait 2000`
  },
  
  // LOGIN AND SELECT STRATEGY
  {
    english: "Login and select the Publisher-based strategy card.",
    dsl: `goto https://app.algopilotx.com
wait 2000
expect input[type="email"]
type input[type="email"] "user@example.com"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000
expect input[type="password"]
type input[type="password"] "password123"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 3000
expect text=Create new automation
click :has-text("Create new automation")
wait 1500
expect :has-text("Publisher-based strategy")
click :has-text("Publisher-based strategy") >> nth=0
wait 1500`
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
