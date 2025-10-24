import TestResultsTable from '../TestResultsTable';

export default function TestResultsTableExample() {
  const mockResults = [
    { id: '1', testName: 'Login Flow', status: 'passed' as const, duration: '1.2s', timestamp: '2 min ago', browser: 'Chrome' },
    { id: '2', testName: 'API Health Check', status: 'failed' as const, duration: '0.5s', timestamp: '5 min ago', browser: 'Firefox' },
    { id: '3', testName: 'Navigation Test', status: 'running' as const, duration: '3.1s', timestamp: 'Just now', browser: 'Safari' },
  ];

  return (
    <TestResultsTable
      results={mockResults}
      onRerun={(id) => console.log('Rerun test:', id)}
      onViewDetails={(id) => console.log('View details:', id)}
    />
  );
}
