import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { FileCode, Info, Blocks, Code, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parsePlaywrightScript } from "@/lib/playwrightParser";
import ScriptBuilder from "@/components/ScriptBuilder";
import AiTestGenerator from "@/components/AiTestGenerator";

interface TestConfig {
  name: string;
  url: string;
  browser: string;
  headless: boolean;
  screenshotOnFail: boolean;
  testScript: string;
}

interface TestConfigFormProps {
  initialConfig?: Partial<TestConfig>;
  onSave?: (config: TestConfig) => void;
  onCancel?: () => void;
}

export default function TestConfigForm({ initialConfig, onSave, onCancel }: TestConfigFormProps) {
  const [config, setConfig] = useState<TestConfig>({
    name: initialConfig?.name || '',
    url: initialConfig?.url || 'https://app.algopilotx.com',
    browser: initialConfig?.browser || 'chromium',
    headless: initialConfig?.headless ?? true,
    screenshotOnFail: initialConfig?.screenshotOnFail ?? true,
    testScript: initialConfig?.testScript || '',
  });
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [playwrightScript, setPlaywrightScript] = useState('');
  const [scriptMode, setScriptMode] = useState<'ai' | 'visual' | 'raw'>('ai');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(config);
  };

  const handleImportPlaywright = () => {
    try {
      const parsed = parsePlaywrightScript(playwrightScript);
      setConfig({ ...config, testScript: parsed.script, url: parsed.url || config.url });
      setShowImportDialog(false);
      setPlaywrightScript('');
      
      if (parsed.warnings && parsed.warnings.length > 0) {
        toast({
          title: "Script imported with warnings",
          description: `Converted successfully, but ${parsed.warnings.length} warning(s) found. Please review the script.`,
        });
      } else {
        toast({
          title: "Script imported",
          description: "Playwright script has been converted successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to parse Playwright script",
        variant: "destructive",
      });
    }
  };

  return (
    <>
    <Card data-testid="card-test-config">
      <CardHeader>
        <CardTitle>Test Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-name">Test Name</Label>
            <Input
              id="test-name"
              placeholder="e.g., Login Flow Test"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              data-testid="input-test-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-url">Target URL</Label>
            <Input
              id="test-url"
              type="url"
              placeholder="https://app.algopilotx.com"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              data-testid="input-test-url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="browser">Browser</Label>
            <Select
              value={config.browser}
              onValueChange={(value) => setConfig({ ...config, browser: value })}
            >
              <SelectTrigger id="browser" data-testid="select-browser">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chromium">Chromium</SelectItem>
                <SelectItem value="firefox">Firefox</SelectItem>
                <SelectItem value="webkit">WebKit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <Label>Test Script</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImportDialog(true)}
                data-testid="button-import-script"
              >
                <FileCode className="h-4 w-4 mr-2" />
                Import from Codegen
              </Button>
            </div>
            
            <Tabs value={scriptMode} onValueChange={(v) => setScriptMode(v as any)} data-testid="tabs-script-mode">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ai" data-testid="tab-ai-generator">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generator
                </TabsTrigger>
                <TabsTrigger value="visual" data-testid="tab-visual-builder">
                  <Blocks className="h-4 w-4 mr-2" />
                  Visual Builder
                </TabsTrigger>
                <TabsTrigger value="raw" data-testid="tab-raw-script">
                  <Code className="h-4 w-4 mr-2" />
                  Raw Script
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="mt-4">
                <AiTestGenerator
                  targetUrl={config.url}
                  onGenerate={(script) => setConfig({ ...config, testScript: script })}
                />
              </TabsContent>

              <TabsContent value="visual" className="mt-4">
                <ScriptBuilder
                  value={config.testScript}
                  onChange={(script) => setConfig({ ...config, testScript: script })}
                />
              </TabsContent>

              <TabsContent value="raw" className="mt-4 space-y-2">
                <Textarea
                  id="test-script"
                  placeholder="Enter your test script or click 'Import from Codegen' to paste a Playwright script..."
                  className="font-mono text-sm min-h-32"
                  value={config.testScript}
                  onChange={(e) => setConfig({ ...config, testScript: e.target.value })}
                  data-testid="input-test-script"
                />
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Simple format: <code className="bg-muted px-1 rounded">goto [url]</code>, <code className="bg-muted px-1 rounded">click [selector]</code>, <code className="bg-muted px-1 rounded">type [selector] "text"</code>, <code className="bg-muted px-1 rounded">select [selector] "option"</code>, <code className="bg-muted px-1 rounded">wait 1000</code>, <code className="bg-muted px-1 rounded">expect [selector]</code>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="headless" className="cursor-pointer">
                Headless Mode
              </Label>
              <Switch
                id="headless"
                checked={config.headless}
                onCheckedChange={(checked) => setConfig({ ...config, headless: checked })}
                data-testid="switch-headless"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="screenshot" className="cursor-pointer">
                Screenshot on Failure
              </Label>
              <Switch
                id="screenshot"
                checked={config.screenshotOnFail}
                onCheckedChange={(checked) => setConfig({ ...config, screenshotOnFail: checked })}
                data-testid="switch-screenshot"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" data-testid="button-save-config">
              Save Configuration
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel-config"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    {showImportDialog && (
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Playwright Script</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>How to generate a Playwright script:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>On your local machine, run: <code className="bg-muted px-1 rounded">npx playwright codegen https://your-url.com</code></li>
                  <li>Perform your test actions in the opened browser</li>
                  <li>Copy the generated test code from the Playwright Inspector</li>
                  <li>Paste it below and click "Import"</li>
                </ol>
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="playwright-script">Paste Playwright Test Code</Label>
              <Textarea
                id="playwright-script"
                placeholder="Paste your Playwright test code here..."
                className="font-mono text-sm min-h-80"
                value={playwrightScript}
                onChange={(e) => setPlaywrightScript(e.target.value)}
                data-testid="textarea-playwright-import"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleImportPlaywright} data-testid="button-confirm-import">
                Import & Convert
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(false)} data-testid="button-cancel-import">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}
