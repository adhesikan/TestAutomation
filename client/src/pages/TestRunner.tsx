import TestRunnerDisplay from "@/components/TestRunnerDisplay";
import { useState, useEffect } from "react";
import { wsClient } from "@/lib/websocket";

export default function TestRunner() {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('Waiting for test execution...');

  useEffect(() => {
    wsClient.connect();

    const handleLog = (data: any) => {
      setLogs((prev) => [...prev, data.message].slice(-50));
      
      const startTestMatch = data.message.match(/\[.+?\] Starting test: (.+)/);
      if (startTestMatch) {
        setCurrentTest(startTestMatch[1]);
        setProgress(0);
      }
    };

    const handleProgress = (data: any) => {
      setProgress(data.progress);
    };

    const handleComplete = (data: any) => {
      setLogs((prev) => [
        ...prev,
        data.success ? '✓ Test completed successfully' : '✗ Test failed',
      ]);
      setProgress(100);
      setTimeout(() => {
        setCurrentTest('Waiting for test execution...');
        setProgress(0);
      }, 3000);
    };

    wsClient.on('log', handleLog);
    wsClient.on('progress', handleProgress);
    wsClient.on('complete', handleComplete);

    return () => {
      wsClient.off('log', handleLog);
      wsClient.off('progress', handleProgress);
      wsClient.off('complete', handleComplete);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Test Runner</h1>
        <p className="text-muted-foreground mt-1">Execute and monitor tests in real-time</p>
      </div>

      <TestRunnerDisplay
        currentTest={currentTest}
        progress={progress}
        logs={logs}
        onPause={() => console.log('Pause clicked')}
        onStop={() => console.log('Stop clicked')}
      />
    </div>
  );
}
