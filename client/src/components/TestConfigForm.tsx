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
import { useState } from "react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(config);
  };

  return (
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
            <Label htmlFor="test-script">Test Script</Label>
            <Textarea
              id="test-script"
              placeholder="Enter your test script or selectors..."
              className="font-mono text-sm min-h-32"
              value={config.testScript}
              onChange={(e) => setConfig({ ...config, testScript: e.target.value })}
              data-testid="input-test-script"
            />
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
  );
}
