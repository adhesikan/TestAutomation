import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface TestRunWithName {
  id: string;
  testId: string;
  testName: string;
  status: 'passed' | 'failed' | 'running';
  startedAt: string;
  duration: number | null;
}

interface TestReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SortField = 'testName' | 'status' | 'startedAt' | 'duration';
type SortDirection = 'asc' | 'desc' | null;

export default function TestReportDialog({ open, onOpenChange }: TestReportDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const { data: testRuns = [] } = useQuery<TestRunWithName[]>({
    queryKey: ['/api/test-runs/detailed'],
    enabled: open,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedRuns = useMemo(() => {
    let filtered = [...testRuns];

    // Filter by test name
    if (searchQuery) {
      filtered = filtered.filter(run =>
        run.testName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(run => new Date(run.startedAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(run => new Date(run.startedAt) <= end);
    }

    // Sort
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        if (sortField === 'startedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (sortField === 'duration') {
          aValue = aValue || 0;
          bValue = bValue || 0;
        } else if (sortField === 'testName' || sortField === 'status') {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    return filtered;
  }, [testRuns, searchQuery, startDate, endDate, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDateTime = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy h:mm a');
    } catch {
      return date;
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setSortField(null);
    setSortDirection(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Test Runs Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="search-test">Test Name</Label>
              <Input
                id="search-test"
                placeholder="Search by test name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-test-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              data-testid="button-reset-filters"
            >
              Reset Filters
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredAndSortedRuns.length} of {testRuns.length} test runs
            </div>
          </div>
        </div>

        <div className="border rounded-md overflow-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('testName')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    data-testid="button-sort-testname"
                  >
                    Test Name
                    <SortIcon field="testName" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('status')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    data-testid="button-sort-status"
                  >
                    Status
                    <SortIcon field="status" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('duration')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    data-testid="button-sort-duration"
                  >
                    Duration
                    <SortIcon field="duration" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('startedAt')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    data-testid="button-sort-date"
                  >
                    Date & Time
                    <SortIcon field="startedAt" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No test runs found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedRuns.map((run) => (
                  <TableRow key={run.id} data-testid={`row-test-run-${run.id}`}>
                    <TableCell className="font-medium">{run.testName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          run.status === 'passed'
                            ? 'default'
                            : run.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                        data-testid={`badge-status-${run.id}`}
                      >
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDuration(run.duration)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(run.startedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2 flex-shrink-0 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-report"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
