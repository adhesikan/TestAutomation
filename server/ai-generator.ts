import OpenAI from "openai";
import { getFewShotExamples, getFewShotExamplesWithVariables } from "./training-dataset";
import { extractedVariablesSchema, type ExtractedVariables } from "@shared/schema";
import { storage } from "./storage";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateTestRequest {
  description: string;
  targetUrl: string;
}

/**
 * Extract variables from natural language using OpenAI structured outputs
 */
async function extractVariables(description: string, targetUrl: string): Promise<ExtractedVariables> {
  const extractionPrompt = `Extract any automation testing variables from this natural language instruction.

Instruction: "${description}"
Target URL: "${targetUrl}"

Extract any of the following if mentioned:
- email: email address
- password: password value
- login_url: base URL for the application (use Target URL if not specified)
- strategy_type: strategy card name (e.g., "Publisher-based strategy", "Option Fundamentals Demo")
- provider_name: provider or signal source (e.g., "TradingView", "Momentum Signals")
- ticker: stock ticker symbol (e.g., "NVDA", "SPY", "AAPL")
- signal_type: specific signal or strategy type (e.g., "Breakout Signal", "Trend Following")
- amount: quantity or number value (e.g., "10", "100")

Only extract variables that are explicitly mentioned or strongly implied in the instruction.
Leave fields empty if not found.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts variables from test automation instructions. Return a JSON object with the extracted variables."
        },
        { 
          role: "user", 
          content: extractionPrompt 
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    const parsed = content ? JSON.parse(content) : {};
    const variables = extractedVariablesSchema.parse(parsed);
    
    // Use targetUrl as login_url if not specified
    if (!variables.login_url && targetUrl) {
      variables.login_url = targetUrl;
    }

    return variables;
  } catch (error) {
    console.error("Variable extraction error:", error);
    // Fallback: return basic variables
    return {
      login_url: targetUrl,
    };
  }
}

/**
 * Substitute placeholders in a string with actual values
 */
function substitutePlaceholders(text: string, variables: ExtractedVariables): string {
  let result = text;
  
  // Replace all {{placeholder}} with actual values
  for (const [key, value] of Object.entries(variables)) {
    if (value && typeof value === 'string') {
      const placeholder = `{{${key}}}`;
      result = result.replaceAll(placeholder, value);
    }
  }
  
  return result;
}

export async function generateTestScript(request: GenerateTestRequest): Promise<string> {
  // Step 1: Extract variables from the user's description
  const variables = await extractVariables(request.description, request.targetUrl);
  console.log("Extracted variables:", variables);

  // Step 2: Get user-contributed datasets from storage
  const userDatasets = await storage.getAllUserDatasets();
  
  // Step 3: Substitute placeholders in training examples and user datasets
  const substitutedFewShots = getFewShotExamplesWithVariables(8, variables);
  const substitutedUserDatasets = userDatasets
    .slice(0, 3) // Limit to 3 most recent
    .map(dataset => ({
      english: dataset.description,
      dsl: dataset.steps.join('\n')
    }))
    .map(example => ({
      english: substitutePlaceholders(example.english, variables),
      dsl: substitutePlaceholders(example.dsl, variables)
    }))
    .map(ex => `Example:
Input: "${ex.english}"
Output:
${ex.dsl}
`)
    .join('\n\n');

  const systemPrompt = `You are an AI that converts natural language instructions into a custom browser automation DSL.

Your job is to output only DSL steps — no explanations, no commentary. 
Each step must be on its own line.

### DSL Syntax Rules:
- Navigate to pages:
  goto <url>

- Pause execution:
  wait <milliseconds>

- Verify UI elements exist:
  expect <selector>

- Click elements:
  click <selector>

- Type text into fields:
  type <selector> "<text>"

- Select from HTML <select> dropdowns (RARE - most dropdowns are custom):
  select <selector> "<option>"

- Scroll the page:
  scroll <pixels>

- Hover over elements:
  hover <selector>

- Press keyboard keys:
  press "<key>"

### CRITICAL: AlgoPilotX-Specific Rules

**LOGIN FLOW** (always use this exact template):
expect input[type="email"]
type input[type="email"] "<email>"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000
expect input[type="password"]
type input[type="password"] "<password>"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 3000

**STRATEGY CARD SELECTION** (always use nth=0):
expect :has-text("<strategy name>")
click :has-text("<strategy name>") >> nth=0
wait 1500

Example: For "Publisher-based strategy"
expect :has-text("Publisher-based strategy")
click :has-text("Publisher-based strategy") >> nth=0
wait 1500

**DROPDOWN MENUS IN ALGOPILOTX**:
AlgoPilotX dropdowns are NOT HTML <select> elements. They are custom div-based menus.
To select from a dropdown:
1. Click the dropdown to open it: click :has-text("<dropdown label>")
2. Wait: wait 500
3. Click the menu item: click :has-text("<menu item text>")
4. Wait: wait 1000

Example: "Select strategy Breakout Signal"
click :has-text("Select Strategy")
wait 500
click :has-text("Breakout Signal")
wait 1000

NEVER use "select <selector> "<option>"" for AlgoPilotX dropdowns.

### General Selector Rules:
- For email fields: input[type="email"]
- For password fields: input[type="password"]
- For number inputs: input[type="number"]
- For inputs by placeholder: input[placeholder="<text>"]
- For buttons: button:has-text("<text>")
- For ID selectors: #element-id
- For clickable text (menu items, cards, links): :has-text("<text>")
- For verification/expect: text=<text> (no quotes)

### Click Selector Examples:
  - click :has-text("Admin") - clicks container with "Admin" text
  - click :has-text("Create new automation") - clicks card/div
  - click :has-text("Settings") - clicks menu item or link
  - click button:has-text("Continue") - specifically clicks a button
  - expect text=Dashboard - verifies text exists (expect only)
  - hover :has-text("Account") - hovers over container

### Proven Examples from Training Dataset:

${substitutedFewShots}

${substitutedUserDatasets ? `\n### User-Contributed Examples:\n${substitutedUserDatasets}` : ''}

### General Output Requirements:
- Do not ask questions.
- Do not add comments.
- Do not repeat the input.
- Do not explain what you are doing.
- Always follow the DSL format exactly.
- Include wait commands between actions (typically 500-2000ms).
- Include expect commands before interacting with elements.
- Use appropriate wait times: 500ms for quick actions, 1500-2000ms after navigation or major state changes.`;

  const userPrompt = `Target URL: ${request.targetUrl}

User instruction:
${request.description}

Generate the DSL steps now:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    let script = completion.choices[0]?.message?.content?.trim() || "";
    
    if (!script) {
      throw new Error("Failed to generate test script");
    }

    // Post-process: Convert legacy formats to correct selectors
    // Convert text("...") to text=... for expect statements
    script = script.replace(/expect\s+text\("([^"]+)"\)/g, 'expect text=$1');
    script = script.replace(/expect\s+text\('([^']+)'\)/g, 'expect text=$1');
    
    // Convert click text= to click :has-text() for proper container clicking
    script = script.replace(/click\s+text=([^\s\n]+(?:\s+[^\s\n]+)*)/g, 'click :has-text("$1")');
    
    // Convert hover text= to hover :has-text()
    script = script.replace(/hover\s+text=([^\s\n]+(?:\s+[^\s\n]+)*)/g, 'hover :has-text("$1")');
    
    // Convert label("...") to :has-text("...") - label() is invalid Playwright syntax
    script = script.replace(/label\("([^"]+)"\)/g, ':has-text("$1")');
    script = script.replace(/label\('([^']+)'\)/g, ':has-text("$1")');
    
    // Step 4: Substitute any remaining placeholders in the generated script
    script = substitutePlaceholders(script, variables);
    
    console.log("Final script with substituted variables:", script);
    
    return script;
  } catch (error: any) {
    console.error("AI generation error:", error);
    throw new Error(`Failed to generate test: ${error.message}`);
  }
}

/**
 * Enhance the training dataset by generating more examples
 * Uses OpenAI to create variations and new scenarios based on existing examples
 */
export async function enhanceTrainingDataset(count: number = 10): Promise<Array<{english: string, dsl: string}>> {
  const systemPrompt = `You are an expert at creating training data for browser automation DSL conversion.

Your task is to generate NEW natural language instructions paired with their corresponding DSL commands.
These examples will be used to train an AI model that converts plain English to browser automation scripts.

### DSL Syntax (same as before):
- goto <url>
- wait <milliseconds>
- expect <selector>
- click <selector>
- type <selector> "<text>"
- select <selector> "<option>" (RARE - only for HTML <select> elements)
- scroll <pixels>
- hover <selector>
- press "<key>"

### CRITICAL: AlgoPilotX-Specific Rules

**LOGIN FLOW** (always use this exact template):
expect input[type="email"]
type input[type="email"] "<email>"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000
expect input[type="password"]
type input[type="password"] "<password>"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 3000

**STRATEGY CARD SELECTION** (always use nth=0):
expect :has-text("<strategy name>")
click :has-text("<strategy name>") >> nth=0
wait 1500

**DROPDOWN MENUS IN ALGOPILOTX**:
AlgoPilotX dropdowns are custom div-based menus. To select from a dropdown:
1. Click the dropdown to open: click :has-text("<dropdown label>")
2. Wait: wait 500
3. Click the menu item: click :has-text("<menu item text>")
4. Wait: wait 1000

NEVER use "select <selector> "<option>"" for AlgoPilotX dropdowns.

### General Selector Rules:
- Email: input[type="email"]
- Password: input[type="password"]
- Number: input[type="number"]
- Placeholder: input[placeholder="text"]
- Buttons: button:has-text("text")
- ID: #element-id
- Clickable text: :has-text("text")
- Verification/expect: text=<text> (no quotes)

Examples:
- click :has-text("Admin") - clicks container with Admin text
- click :has-text("Settings") - clicks menu/link item
- click :has-text("Publisher-based strategy") >> nth=0 - clicks strategy card
- click button:has-text("Continue") - clicks button specifically
- expect text=Dashboard - verifies text (expect only)
- hover :has-text("Account") - hovers over container

### Output Format:
Return ONLY a JSON array with this structure:
[
  {
    "english": "Natural language instruction",
    "dsl": "command1\\ncommand2\\ncommand3"
  }
]

Create diverse examples covering:
- Login/logout workflows
- Form submissions
- Navigation between pages
- Search functionality
- Data entry
- Validation checking
- Multi-step processes
- E-commerce actions
- Account management
- Settings configuration

Make examples realistic and varied. Include appropriate wait times and expect statements.`;

  const userPrompt = `Generate ${count} new, diverse training examples for browser automation.
Focus on common web application scenarios that users would want to automate.
Include both simple single-action examples and complex multi-step workflows.

Return the JSON array now:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "";
    
    if (!responseText) {
      throw new Error("Failed to enhance dataset");
    }

    // Parse the JSON response
    const parsed = JSON.parse(responseText);
    const examples = parsed.examples || parsed;
    
    if (!Array.isArray(examples)) {
      throw new Error("Invalid response format");
    }

    return examples;
  } catch (error: any) {
    console.error("Dataset enhancement error:", error);
    throw new Error(`Failed to enhance dataset: ${error.message}`);
  }
}
