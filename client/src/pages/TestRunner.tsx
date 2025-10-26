import TestRunnerDisplay from "@/components/TestRunnerDisplay";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { wsClient } from "@/lib/websocket";
import type { TestRun, Test } from "@shared/schema";

export default function TestRunner() {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [isLiveTest, setIsLiveTest] = useState(false);

  const { data: latestRun } = useQuery<TestRun>({
    queryKey: ['/api/test-runs/latest'],
    queryFn: async () => {
      const response = await fetch('/api/test-runs?limit=1');
      if (!response.ok) throw new Error('Failed to fetch test runs');
      const runs = await response.json();
      return runs[0] || null;
    },
    refetchInterval: 5000,
  });

  const { data: test } = useQuery<Test>({
    queryKey: ['/api/tests', latestRun?.testId],
    queryFn: async () => {
      if (!latestRun?.testId) return null;
      const response = await fetch(`/api/tests/${latestRun.testId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!latestRun?.testId && !isLiveTest,
  });

  useEffect(() => {
    if (!isLiveTest && latestRun && test) {
      setCurrentTest(test.name);
      if (latestRun.logs) {
        setLogs(latestRun.logs.split('\n'));
      }
      if (latestRun.status === 'passed') {
        setProgress(100);
      } else if (latestRun.status === 'failed') {
        setProgress(100);
      }
    }
  }, [latestRun, test, isLiveTest]);

  useEffect(() => {
    wsClient.connect();

    const handleLog = (data: any) => {
      setIsLiveTest(true);
      setLogs((prev) => [...prev, data.message].slice(-50));
      
      const startTestMatch = data.message.match(/\[.+?\] Starting test: (.+)/);
      if (startTestMatch) {
        setCurrentTest(startTestMatch[1]);
        setProgress(0);
      }
    };

    const handleProgress = (data: any) => {
      setIsLiveTest(true);
      setProgress(data.progress);
    };

    const handleComplete = (data: any) => {
      setLogs((prev) => [
        ...prev,
        data.success ? '✓ Test completed successfully' : '✗ Test failed',
      ]);
      setProgress(100);
      setTimeout(() => {
        setIsLiveTest(false);
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

  const displayTest = currentTest || (isLiveTest ? 'Waiting for test execution...' : 'No tests run yet');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Test Runner</h1>
        <p className="text-muted-foreground mt-1">Execute and monitor tests in real-time</p>
      </div>

      <TestRunnerDisplay
        currentTest={displayTest}
        progress={progress}
        logs={logs}
        onPause={() => console.log('Pause clicked')}
        onStop={() => console.log('Stop clicked')}
      />
    </div>
  );
}
