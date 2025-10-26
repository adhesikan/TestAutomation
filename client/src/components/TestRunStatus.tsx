import { useQuery } from "@tanstack/react-query";
import type { TestRun } from "@shared/schema";
import TestStatusBadge, { TestStatus } from "./TestStatusBadge";

interface TestRunStatusProps {
  testId: string;
}

export default function TestRunStatus({ testId }: TestRunStatusProps) {
  const { data: testRuns = [] } = useQuery<TestRun[]>({
    queryKey: ['/api/tests', testId, 'runs'],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${testId}/runs`);
      if (!response.ok) throw new Error('Failed to fetch test runs');
      return response.json();
    },
  });

  if (testRuns.length === 0) {
    return <span className="text-muted-foreground text-sm">Not run</span>;
  }

  const latestRun = testRuns[0];
  return <TestStatusBadge status={latestRun.status as TestStatus} />;
}
