import TestRunnerDisplay from "@/components/TestRunnerDisplay";
import { useState, useEffect } from "react";

export default function TestRunner() {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    '[10:30:45] Starting test suite: Authentication',
    '[10:30:46] Running test: Login with valid credentials',
    '[10:30:47] ✓ User navigated to login page',
  ]);

  // Simulate test progress - todo: remove mock functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 5;
      });

      if (Math.random() > 0.7) {
        const newLog = `[${new Date().toLocaleTimeString()}] ${
          ['✓ Test step completed', '⚠ Warning detected', 'ℹ Info message'][Math.floor(Math.random() * 3)]
        }`;
        setLogs((prev) => [...prev, newLog].slice(-20));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Test Runner</h1>
        <p className="text-muted-foreground mt-1">Execute and monitor tests in real-time</p>
      </div>

      <TestRunnerDisplay
        currentTest="Login with invalid credentials"
        progress={progress}
        logs={logs}
        onPause={() => console.log('Pause clicked')}
        onStop={() => console.log('Stop clicked')}
      />
    </div>
  );
}
