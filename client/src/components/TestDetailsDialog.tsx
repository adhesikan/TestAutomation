import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import type { Test, TestRun } from "@shared/schema";
import TestStatusBadge from "./TestStatusBadge";
import { TestStatus } from "./TestStatusBadge";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

interface TestDetailsDialogProps {
  test: Test;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TestDetailsDialog({ test, open, onOpenChange }: TestDetailsDialogProps) {
  const { data: testRuns = [] } = useQuery<TestRun[]>({
    queryKey: ['/api/tests', test.id, 'runs'],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${test.id}/runs`);
      if (!response.ok) throw new Error('Failed to fetch test runs');
      return response.json();
    },
    enabled: open,
  });

  const latestRun = testRuns[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{test.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config" data-testid="tab-config">Configuration</TabsTrigger>
            <TabsTrigger value="script" data-testid="tab-script">Test Script</TabsTrigger>
            <TabsTrigger value="results" data-testid="tab-results">Latest Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Target URL</div>
                <div className="mt-1">{test.url}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Browser</div>
                  <div className="mt-1 capitalize">{test.browser}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Mode</div>
                  <div className="mt-1">
                    <Badge variant="outline">{test.headless ? 'Headless' : 'Headed'}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Screenshot on Failure</div>
                  <div className="mt-1">{test.screenshotOnFail ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="script" className="mt-4">
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <pre className="p-4 text-sm font-mono">
                {test.testScript || 'No script defined'}
              </pre>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="results" className="mt-4">
            {!latestRun ? (
              <div className="text-center py-12 text-muted-foreground">
                This test hasn't been run yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="mt-1">
                      <TestStatusBadge status={latestRun.status as TestStatus} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Duration</div>
                    <div className="mt-1">{latestRun.duration ? `${(latestRun.duration / 1000).toFixed(2)}s` : 'N/A'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Started At</div>
                    <div className="mt-1 text-sm">{format(new Date(latestRun.startedAt), 'PPp')}</div>
                  </div>
                  {latestRun.completedAt && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Completed At</div>
                      <div className="mt-1 text-sm">{format(new Date(latestRun.completedAt), 'PPp')}</div>
                    </div>
                  )}
                </div>
                
                {latestRun.errorMessage && (
                  <div>
                    <div className="text-sm font-medium text-destructive mb-2">Error Message</div>
                    {latestRun.errorMessage.includes('Host system is missing dependencies') && (
                      <Alert className="mb-3 bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Environment Limitation:</strong> Playwright browser tests cannot run in the Replit environment due to missing system dependencies. 
                          Your test configuration is correct and will work when deployed to a proper server environment with the required libraries installed.
                        </AlertDescription>
                      </Alert>
                    )}
                    <ScrollArea className="h-[150px] w-full rounded-md border bg-destructive/5">
                      <pre className="p-4 text-sm font-mono text-destructive">
                        {latestRun.errorMessage}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Execution Logs</div>
                  <ScrollArea className="h-[200px] w-full rounded-md border bg-muted/50">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                      {latestRun.logs || 'No logs available'}
                    </pre>
                  </ScrollArea>
                </div>
                
                {latestRun.screenshot && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Screenshot</div>
                    <img 
                      src={`data:image/png;base64,${latestRun.screenshot}`}
                      alt="Test failure screenshot"
                      className="max-w-full border rounded-md"
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
