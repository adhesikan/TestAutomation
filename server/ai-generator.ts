import OpenAI from "openai";
import { getFewShotExamples } from "./training-dataset";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateTestRequest {
  description: string;
  targetUrl: string;
}

export async function generateTestScript(request: GenerateTestRequest): Promise<string> {
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

${getFewShotExamples(8)}

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
- select <selector> "<option>"
- scroll <pixels>
- hover <selector>
- press "<key>"

### Selector Rules:
- Email: input[type="email"]
- Password: input[type="password"]
- Number: input[type="number"]
- Placeholder: input[placeholder="text"]
- Button (specific): button:has-text("text")
- ID: #element-id
- Only use "select <selector> "<option>"" for actual HTML <select> dropdown elements

CRITICAL CLICK SELECTOR RULES:
- For clicking text elements (menu items, cards, links, list items, strategy items, dropdown-like lists): :has-text("text")
- For clicking specific buttons: button:has-text("text")
- For expect statements: text=Label (no quotes)

Examples:
- click :has-text("Admin") - clicks container with Admin text
- click :has-text("Settings") - clicks menu/link item
- click :has-text("Publisher-based strategy") - clicks strategy card or list item
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
