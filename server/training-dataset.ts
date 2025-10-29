/**
 * Training dataset for AI test script generation
 * Format: Natural language instruction → DSL commands
 */

export const trainingExamples = [
  // LOGIN / AUTH WORKFLOWS
  {
    english: "Go to the login page and wait for it to load.",
    dsl: `goto {{login_url}}
wait 1500`
  },
  {
    english: "Enter the email and click continue.",
    dsl: `expect input[type="email"]
type input[type="email"] "{{email}}"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000`
  },
  {
    english: "Now type the password and log in.",
    dsl: `expect input[type="password"]
type input[type="password"] "{{password}}"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 3000`
  },
  {
    english: "Log in using these credentials: email {{email}} password {{password}}.",
    dsl: `expect input[type="email"]
type input[type="email"] "{{email}}"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000
expect input[type="password"]
type input[type="password"] "{{password}}"
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
    dsl: `goto {{login_url}}/dashboard
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
    english: "Fill the ticker field with {{ticker}}.",
    dsl: `expect input[placeholder="Ticker"]
type input[placeholder="Ticker"] "{{ticker}}"
wait 500`
  },
  {
    english: "Enter quantity of {{amount}} shares.",
    dsl: `expect input[type="number"]
type input[type="number"] "{{amount}}"
wait 500`
  },
  {
    english: "Clear the field and type {{ticker}}.",
    dsl: `click input
press "Control+A"
press "Backspace"
type input "{{ticker}}"
wait 500`
  },
  
  // STRATEGY CARD SELECTION (always use nth=0)
  {
    english: "Select the {{strategy_type}} strategy card.",
    dsl: `expect :has-text("{{strategy_type}}")
click :has-text("{{strategy_type}}") >> nth=0
wait 1500`
  },
  {
    english: "Choose {{strategy_type}} strategy.",
    dsl: `expect :has-text("{{strategy_type}}")
click :has-text("{{strategy_type}}") >> nth=0
wait 1500`
  },
  
  // CUSTOM DROPDOWN MENUS (click to open, click to select)
  {
    english: "Select strategy {{signal_type}} from the dropdown.",
    dsl: `click :has-text("Select Strategy")
wait 500
click :has-text("{{signal_type}}")
wait 1000`
  },
  {
    english: "Choose {{provider_name}} from the Source dropdown.",
    dsl: `click :has-text("Source")
wait 500
click :has-text("{{provider_name}}")
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
    english: "Create a new {{ticker}} stock automation setup with {{strategy_type}} strategy.",
    dsl: `goto {{login_url}}
wait 2000
expect text=Create new automation
click :has-text("Create new automation")
wait 1500
expect :has-text("{{strategy_type}}")
click :has-text("{{strategy_type}}") >> nth=0
wait 1500
click :has-text("Configure Single Strategy")
wait 1000
click :has-text("Select Strategy")
wait 500
click :has-text("{{signal_type}}")
wait 1000
expect input[placeholder="Ticker"]
type input[placeholder="Ticker"] "{{ticker}}"
wait 500
click :has-text("Equity Type")
wait 500
click :has-text("Stock")
wait 1000
expect input[type="number"]
type input[type="number"] "{{amount}}"
wait 500
expect button:has-text("Create Automation")
click button:has-text("Create Automation")
wait 2000`
  },
  
  // LOGIN AND SELECT STRATEGY
  {
    english: "Login and select the {{strategy_type}} strategy card.",
    dsl: `goto {{login_url}}
wait 2000
expect input[type="email"]
type input[type="email"] "{{email}}"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000
expect input[type="password"]
type input[type="password"] "{{password}}"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 3000
expect text=Create new automation
click :has-text("Create new automation")
wait 1500
expect :has-text("{{strategy_type}}")
click :has-text("{{strategy_type}}") >> nth=0
wait 1500`
  },

  // GENERIC WORKFLOW EXAMPLES (USER-CONTRIBUTED)
  {
    english: "Go to the AlgoPilotX login page",
    dsl: `goto {{login_url}}
wait 2000`
  },
  {
    english: "Enter the user's email and click Continue",
    dsl: `expect input[type="email"]
type input[type="email"] "{{email}}"
wait 2000
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000`
  },
  {
    english: "Enter the user's password and sign in",
    dsl: `expect input[type="password"]
type input[type="password"] "{{password}}"
wait 2000
expect button:has-text("Continue")
click button:has-text("Continue")
wait 3000`
  },
  {
    english: "Begin creating a new automation",
    dsl: `expect text=Create new automation
click :has-text("Create new automation")
wait 3000
expect text=Select your provider
wait 1000`
  },
  {
    english: "Select a strategy type",
    dsl: `expect button:has-text("{{strategy_type}}")
click button:has-text("{{strategy_type}}")
wait 2000`
  },
  {
    english: "Select a provider",
    dsl: `click :has-text("Select Option")
wait 500
click :has-text("{{provider_name}}")
wait 1000
expect button:has-text("Configure Single Strategy")
click button:has-text("Configure Single Strategy")
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

/**
 * Generate few-shot examples with variable substitution
 */
export function getFewShotExamplesWithVariables(count: number, variables: any): string {
  const examples = trainingExamples.slice(0, count);
  
  // Substitute placeholders in examples
  const substitutedExamples = examples.map(ex => {
    let english = ex.english;
    let dsl = ex.dsl;
    
    // Replace all {{placeholder}} with actual values
    for (const [key, value] of Object.entries(variables)) {
      if (value && typeof value === 'string') {
        const placeholder = `{{${key}}}`;
        english = english.replaceAll(placeholder, value);
        dsl = dsl.replaceAll(placeholder, value);
      }
    }
    
    return { english, dsl };
  });
  
  return substitutedExamples.map(ex => `ENGLISH: ${ex.english}\n\nDSL:\n${ex.dsl}`).join('\n\n---\n\n');
}
