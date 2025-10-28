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

- Select from dropdowns:
  select <selector> "<option>"

- Scroll the page:
  scroll <pixels>

- Hover over elements:
  hover <selector>

- Press keyboard keys:
  press "<key>"

Selectors should follow these rules:
- For email fields, use: input[type="email"]
- For password fields, use: input[type="password"]
- For number inputs, use: input[type="number"]
- For inputs by placeholder, use: input[placeholder="<text>"]
- For buttons, use: button:has-text("<text>")
- For text inside elements, use: text("<partial or exact text>")
- For labels, use: label("<text>")
- For ID selectors, use: #element-id

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

    const script = completion.choices[0]?.message?.content?.trim() || "";
    
    if (!script) {
      throw new Error("Failed to generate test script");
    }

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
- Button: button:has-text("text")
- Text: text("text")
- Label: label("text")
- ID: #element-id

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
