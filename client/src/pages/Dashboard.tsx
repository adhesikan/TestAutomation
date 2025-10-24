import MetricsCard from "@/components/MetricsCard";
import TestResultCard from "@/components/TestResultCard";
import PassFailChart from "@/components/PassFailChart";
import { CheckCircle2, XCircle, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { TestRun } from "@shared/schema";

interface Stats {
  totalTests: number;
  passRate: string;
  failedTests: number;
  avgDuration: string;
}

export default function Dashboard() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });

  const { data: recentTestRuns = [] } = useQuery<TestRun[]>({
    queryKey: ['/api/test-runs'],
    refetchInterval: 5000,
  });

  const formatTimestamp = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  const chartData = [
    { date: 'Mon', passed: 45, failed: 3 },
    { date: 'Tue', passed: 52, failed: 2 },
    { date: 'Wed', passed: 48, failed: 5 },
    { date: 'Thu', passed: 55, failed: 1 },
    { date: 'Fri', passed: 51, failed: 4 },
    { date: 'Sat', passed: 47, failed: 2 },
    { date: 'Sun', passed: 49, failed: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor your automated tests for app.algopilotx.com</p>
        </div>
        <Button data-testid="button-run-all-tests">
          <Play className="h-4 w-4 mr-2" />
          Run All Tests
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Tests"
          value={stats?.totalTests ?? 0}
          icon={Activity}
          subtitle="Across all suites"
        />
        <MetricsCard
          title="Pass Rate"
          value={stats?.passRate ?? '0%'}
          icon={CheckCircle2}
        />
        <MetricsCard
          title="Failed Tests"
          value={stats?.failedTests ?? 0}
          icon={XCircle}
        />
        <MetricsCard
          title="Avg Duration"
          value={stats?.avgDuration ?? '0s'}
          icon={Clock}
          subtitle="Per test"
        />
      </div>

      <PassFailChart data={chartData} />

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Test Runs</h2>
        {recentTestRuns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No test runs yet. Create and run your first test to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTestRuns.slice(0, 6).map((run) => (
              <TestResultCard
                key={run.id}
                testName={`Test Run ${run.testId.slice(0, 8)}`}
                status={run.status as any}
                duration={run.duration ? `${(run.duration / 1000).toFixed(1)}s` : undefined}
                timestamp={formatTimestamp(run.startedAt)}
                logs={run.logs || undefined}
                onRerun={() => console.log('Rerun:', run.id)}
                onViewDetails={() => console.log('View details:', run.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
