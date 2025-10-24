import TestConfigForm from "@/components/TestConfigForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [appUrl, setAppUrl] = useState('https://app.algopilotx.com');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [email, setEmail] = useState('');
  const [webhook, setWebhook] = useState('');

  const handleSaveAppSettings = () => {
    toast({
      title: "Settings saved",
      description: "Application settings have been updated.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Settings saved",
      description: "Notification settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your testing environment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Target Application</CardTitle>
              <CardDescription>Configure the application under test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-url">Application URL</Label>
                <Input
                  id="app-url"
                  type="url"
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  data-testid="input-app-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-endpoint">API Endpoint</Label>
                <Input
                  id="api-endpoint"
                  type="url"
                  placeholder="https://api.algopilotx.com"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  data-testid="input-api-endpoint"
                />
              </div>
              <Button onClick={handleSaveAppSettings} data-testid="button-save-app-settings">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email for Alerts</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-notification-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input
                  id="webhook"
                  type="url"
                  placeholder="https://hooks.slack.com/..."
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  data-testid="input-webhook-url"
                />
              </div>
              <Button onClick={handleSaveNotifications} data-testid="button-save-notification-settings">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <TestConfigForm
            onSave={(config) => console.log('Config saved:', config)}
            onCancel={() => console.log('Cancel clicked')}
          />
        </div>
      </div>
    </div>
  );
}
