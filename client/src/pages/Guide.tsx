import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Terminal, FileCode, Upload, Play, Info } from "lucide-react";

export default function Guide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Test Creation Guide</h1>
        <p className="text-muted-foreground mt-1">Learn how to create tests using Playwright Codegen</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This guide shows you how to use <strong>Playwright Codegen locally</strong> to record browser interactions,
          then import the generated scripts into your cloud-based test automation platform.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Step 1: Set Up Playwright Locally
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Install Playwright on your computer:</h3>
            <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
              npm init playwright@latest
            </pre>
            <p className="text-sm text-muted-foreground mt-2">
              Or if you already have a project:
            </p>
            <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
              npm install -D @playwright/test
              npx playwright install
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Step 2: Record Your Test with Codegen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Launch Playwright Codegen:</h3>
            <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
              npx playwright codegen https://your-target-url.com
            </pre>
            <p className="text-sm text-muted-foreground mt-2">
              Example:
            </p>
            <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
              npx playwright codegen https://staging.algopilotx.com
            </pre>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">What happens next:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>A browser window opens showing your target URL</li>
              <li>The Playwright Inspector window opens alongside it</li>
              <li>As you interact with the website (click, type, navigate), Playwright records every action</li>
              <li>The generated test code appears in real-time in the Inspector</li>
            </ol>
          </div>

          <Alert className="bg-blue-500/10 border-blue-500/20">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm">
              <strong>Tip:</strong> Perform your test flow slowly and deliberately. Codegen captures clicks, text input,
              navigation, and element interactions automatically.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Step 3: Import the Generated Script
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Copy the test code:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>In the Playwright Inspector, locate the generated test code</li>
              <li>Click the <strong>Copy</strong> button or select all the code (Ctrl+A / Cmd+A)</li>
              <li>Copy it to your clipboard (Ctrl+C / Cmd+C)</li>
            </ol>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Import into the platform:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to <strong>Test Suites</strong> page</li>
              <li>Click <strong>Create Test</strong></li>
              <li>In the test script section, click <strong>Import from Codegen</strong></li>
              <li>Paste your Playwright code into the dialog</li>
              <li>Click <strong>Import & Convert</strong></li>
            </ol>
          </div>

          <Alert className="bg-green-500/10 border-green-500/20">
            <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-sm">
              <strong>Automatic Conversion:</strong> The platform automatically converts Playwright test code into 
              our simplified script format that works in cloud environments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Step 4: Run Your Test in the Cloud
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Configure and execute:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Review the converted script in the test configuration</li>
              <li>Set browser type (Chromium, Firefox, or WebKit)</li>
              <li>Enable <strong>Headless Mode</strong> (required for cloud execution)</li>
              <li>Click <strong>Save Configuration</strong></li>
              <li>Click the <strong>Play</strong> button to run your test</li>
            </ol>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Monitor execution:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Watch real-time logs in the Test Runner page</li>
              <li>View test results and execution history</li>
              <li>Screenshots are automatically captured on failures</li>
              <li>Schedule automated runs using cron expressions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-400">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Why local Codegen?</strong>
            <p className="text-muted-foreground mt-1">
              Playwright Codegen requires a visible browser window, which only works on computers with displays.
              Cloud servers (where your tests run) don't have displays, so we record locally and execute in the cloud.
            </p>
          </div>
          <Separator />
          <div>
            <strong>Headless mode is required:</strong>
            <p className="text-muted-foreground mt-1">
              All tests running on cloud servers must use headless mode (browser runs without a visible window).
              This is standard for automated testing platforms.
            </p>
          </div>
          <Separator />
          <div>
            <strong>Supported Playwright commands:</strong>
            <p className="text-muted-foreground mt-1 mb-2">
              The script parser automatically converts these common Playwright commands:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code className="bg-muted px-1 rounded">page.goto()</code> - Navigate to URL</li>
              <li><code className="bg-muted px-1 rounded">page.click()</code>, <code className="bg-muted px-1 rounded">page.locator().click()</code> - Click elements</li>
              <li><code className="bg-muted px-1 rounded">page.fill()</code>, <code className="bg-muted px-1 rounded">page.type()</code> - Enter text</li>
              <li><code className="bg-muted px-1 rounded">getByRole('button')</code>, <code className="bg-muted px-1 rounded">getByRole('link')</code> - Role-based element finding (without accessible names)</li>
              <li><code className="bg-muted px-1 rounded">getByText()</code>, <code className="bg-muted px-1 rounded">getByPlaceholder()</code>, <code className="bg-muted px-1 rounded">getByTestId()</code> - Find elements by text, placeholder, or test ID</li>
              <li><code className="bg-muted px-1 rounded">waitForSelector()</code> - Wait for elements</li>
              <li><code className="bg-muted px-1 rounded">expect().toBeVisible()</code>, <code className="bg-muted px-1 rounded">expect().toHaveText()</code> - Basic assertions</li>
              <li><code className="bg-muted px-1 rounded">press()</code> - Keyboard actions (converted to wait)</li>
            </ul>
          </div>
          <Separator />
          <div>
            <strong>NOT Supported - Requires Manual Addition:</strong>
            <p className="text-muted-foreground mt-1 mb-2">
              These Playwright locators cannot be reliably converted and will be listed as "unconverted lines":
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>getByLabel()</strong> - Cannot reliably resolve label→input associations. <strong>Manually replace with</strong> <code className="bg-muted px-1 rounded">getByPlaceholder()</code> or direct CSS selectors</li>
              <li><strong>getByRole() with accessible names</strong> (e.g., <code className="bg-muted px-1 rounded">getByRole('textbox', {'{name: "Email"}'}")</code>) - Cannot reliably map accessible names. <strong>Manually replace with</strong> <code className="bg-muted px-1 rounded">getByPlaceholder()</code> or other locators</li>
              <li>Complex locator chains and conditional logic</li>
              <li>Variables and data-driven tests</li>
              <li>File uploads and downloads</li>
              <li>Advanced assertions and custom matchers</li>
              <li>Page object models and helper functions</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2 font-semibold">
              ⚠️ After importing, review the "unconverted lines" notification. You'll need to manually add these commands using alternative selectors. The parser converts 70-80% of typical Codegen output automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <strong>Scenario:</strong> Testing a login flow on staging.algopilotx.com
          </div>
          <Separator />
          <div>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <strong>Record locally:</strong>
                <pre className="bg-muted p-3 rounded-md font-mono text-xs mt-2 overflow-x-auto">
npx playwright codegen https://staging.algopilotx.com
                </pre>
                <p className="text-muted-foreground mt-1 ml-5">
                  → Click login button → Enter email → Enter password → Submit
                </p>
              </li>
              <li>
                <strong>Copy generated code:</strong>
                <pre className="bg-muted p-3 rounded-md font-mono text-xs mt-2 overflow-x-auto">
{`await page.goto('https://staging.algopilotx.com');
await page.click('button:has-text("Login")');
await page.fill('input[name="email"]', 'user@example.com');
await page.fill('input[name="password"]', 'password123');
await page.click('button[type="submit"]');`}
                </pre>
              </li>
              <li>
                <strong>Import to platform:</strong>
                <p className="text-muted-foreground mt-1 ml-5">
                  Create Test → Import from Codegen → Paste → Import & Convert
                </p>
              </li>
              <li>
                <strong>Converted script:</strong>
                <pre className="bg-muted p-3 rounded-md font-mono text-xs mt-2 overflow-x-auto">
{`goto https://staging.algopilotx.com
click button:has-text("Login")
type input[name="email"] "user@example.com"
type input[name="password"] "password123"
click button[type="submit"]`}
                </pre>
              </li>
              <li>
                <strong>Run in cloud:</strong>
                <p className="text-muted-foreground mt-1 ml-5">
                  Save → Enable Headless → Run Test → View Results
                </p>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
