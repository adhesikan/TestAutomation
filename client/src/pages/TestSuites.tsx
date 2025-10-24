import { Button } from "@/components/ui/button";
import TestResultsTable from "@/components/TestResultsTable";
import { Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TestSuites() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - todo: remove mock functionality
  const allTests = [
    { id: '1', testName: 'Login Flow - Valid Credentials', status: 'passed' as const, duration: '1.2s', timestamp: '2 min ago', browser: 'Chrome 120' },
    { id: '2', testName: 'Login Flow - Invalid Credentials', status: 'passed' as const, duration: '0.9s', timestamp: '2 min ago', browser: 'Chrome 120' },
    { id: '3', testName: 'API Health Check - /api/status', status: 'failed' as const, duration: '0.5s', timestamp: '5 min ago', browser: 'Firefox 121' },
    { id: '4', testName: 'API Health Check - /api/health', status: 'passed' as const, duration: '0.4s', timestamp: '5 min ago', browser: 'Firefox 121' },
    { id: '5', testName: 'Dashboard Navigation Test', status: 'running' as const, duration: '3.1s', timestamp: 'Just now', browser: 'Safari 17' },
    { id: '6', testName: 'Settings Page Load', status: 'passed' as const, duration: '1.5s', timestamp: '10 min ago', browser: 'Chrome 120' },
    { id: '7', testName: 'Profile Update Flow', status: 'passed' as const, duration: '2.3s', timestamp: '15 min ago', browser: 'Firefox 121' },
    { id: '8', testName: 'Password Reset Request', status: 'scheduled' as const, duration: '-', timestamp: 'In 5 min', browser: 'Chrome 120' },
  ];

  const filteredTests = allTests.filter(test =>
    test.testName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Test Suites</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your automated tests</p>
        </div>
        <Button data-testid="button-create-test">
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-tests"
          />
        </div>
        <Button variant="outline" data-testid="button-filter">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <TestResultsTable
        results={filteredTests}
        onRerun={(id) => console.log('Rerun test:', id)}
        onViewDetails={(id) => console.log('View details:', id)}
      />
    </div>
  );
}
