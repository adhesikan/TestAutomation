import OpenAI from "openai";

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

Selectors should follow these rules:
- For email fields, use: input[type="email"]
- For password fields, use: input[type="password"]
- For normal text inputs, use: input, textarea, or role-based selectors if clearly identified.
- For buttons, use: button:has-text("<text>")
- For text inside cards/rows/lists, use: text("<partial or exact text>")

### Input → Output Examples

**Input:**
Go to the login page, enter email, click continue.

**Output:**
goto https://staging.algopilotx.com
wait 1500
expect input[type="email"]
type input[type="email"] "your-email-here"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000

---

**Input:**
Login with email and password.

**Output:**
expect input[type="email"]
type input[type="email"] "myemail@example.com"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000
expect input[type="password"]
type input[type="password"] "mypassword123"
wait 500
expect button:has-text("Continue")
click button:has-text("Continue")
wait 2000

---

### General Output Requirements:
- Do not ask questions.
- Do not add comments.
- Do not repeat the input.
- Do not explain what you are doing.
- Always follow the DSL format exactly.`;

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
