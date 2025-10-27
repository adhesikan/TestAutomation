import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateTestRequest {
  description: string;
  targetUrl: string;
}

export async function generateTestScript(request: GenerateTestRequest): Promise<string> {
  const systemPrompt = `You are an expert at creating browser automation test scripts. 
Generate test scripts using this simple format:
- goto <url> - Navigate to a URL
- click <selector> - Click an element
- type <selector> "text" - Type text into an element
- wait <milliseconds> - Wait for a specified time
- expect <selector> - Assert an element exists

Use CSS selectors (id, class, attribute, etc.) for targeting elements.
Return ONLY the test script lines, no explanations or markdown.`;

  const userPrompt = `Create a test script for: ${request.description}

Target URL: ${request.targetUrl}

Generate a complete test script that:
1. Starts by navigating to the target URL
2. Performs the actions described
3. Includes appropriate waits and expectations
4. Uses specific CSS selectors (prefer IDs when possible, then classes, then other attributes)

Return only the script commands, one per line.`;

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
