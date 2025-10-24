import MetricsCard from "@/components/MetricsCard";
import TestResultCard from "@/components/TestResultCard";
import PassFailChart from "@/components/PassFailChart";
import { CheckCircle2, XCircle, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function Dashboard() {
  // Mock data - todo: remove mock functionality
  const metricsData = [
    { title: "Total Tests", value: "248", icon: Activity, subtitle: "Across all suites" },
    { title: "Pass Rate", value: "94.2%", icon: CheckCircle2, trend: { value: "2.1% from yesterday", positive: true } },
    { title: "Failed Tests", value: "12", icon: XCircle, trend: { value: "3 from yesterday", positive: false } },
    { title: "Avg Duration", value: "2.4s", icon: Clock, subtitle: "Per test" },
  ];

  const recentTests = [
    {
      testName: "Authentication Flow - Login",
      status: 'passed' as const,
      duration: "1.2s",
      timestamp: "2 minutes ago",
      browser: "Chrome 120",
    },
    {
      testName: "API Health Check - /api/status",
      status: 'failed' as const,
      duration: "0.8s",
      timestamp: "5 minutes ago",
      browser: "Firefox 121",
      logs: "Error: Request timeout after 5000ms\n  at api-health.spec.ts:23\n  Expected status 200, received 504",
    },
    {
      testName: "Dashboard Navigation Test",
      status: 'running' as const,
      duration: "3.1s",
      timestamp: "Just now",
      browser: "Safari 17",
    },
  ];

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
        {metricsData.map((metric) => (
          <MetricsCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metric.icon}
            trend={metric.trend}
          />
        ))}
      </div>

      <PassFailChart data={chartData} />

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Test Runs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTests.map((test, index) => (
            <TestResultCard
              key={index}
              testName={test.testName}
              status={test.status}
              duration={test.duration}
              timestamp={test.timestamp}
              browser={test.browser}
              logs={test.logs}
              onRerun={() => console.log('Rerun:', test.testName)}
              onViewDetails={() => console.log('View details:', test.testName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
