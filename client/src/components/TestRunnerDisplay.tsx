import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pause, Square } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TestRunnerDisplayProps {
  currentTest: string;
  progress: number;
  logs: string[];
  onPause?: () => void;
  onStop?: () => void;
}

export default function TestRunnerDisplay({
  currentTest,
  progress,
  logs,
  onPause,
  onStop,
}: TestRunnerDisplayProps) {
  return (
    <Card data-testid="card-test-runner">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-lg">Test Execution</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPause}
            data-testid="button-pause-test"
          >
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onStop}
            data-testid="button-stop-test"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Current: {currentTest}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} data-testid="progress-test-execution" />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Live Logs</h4>
          <ScrollArea className="h-64 border rounded-md bg-muted p-3">
            <div className="font-mono text-xs space-y-1" data-testid="text-live-logs">
              {logs.map((log, index) => (
                <div key={index} className="text-muted-foreground">
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
