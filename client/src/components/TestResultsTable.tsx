import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import TestStatusBadge, { TestStatus } from "./TestStatusBadge";
import { Play, Eye, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface TestResult {
  id: string;
  testName: string;
  status: TestStatus;
  duration: string;
  timestamp: string;
  browser: string;
}

interface TestResultsTableProps {
  results: TestResult[];
  onRerun?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

type SortField = 'testName' | 'status' | 'duration' | 'timestamp';

export default function TestResultsTable({ results, onRerun, onViewDetails }: TestResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    const mult = sortAsc ? 1 : -1;
    if (a[sortField] < b[sortField]) return -1 * mult;
    if (a[sortField] > b[sortField]) return 1 * mult;
    return 0;
  });

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('testName')}
                className="h-8 hover-elevate"
                data-testid="button-sort-name"
              >
                Test Name
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('status')}
                className="h-8 hover-elevate"
                data-testid="button-sort-status"
              >
                Status
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('duration')}
                className="h-8 hover-elevate"
                data-testid="button-sort-duration"
              >
                Duration
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('timestamp')}
                className="h-8 hover-elevate"
                data-testid="button-sort-timestamp"
              >
                Timestamp
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Browser</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((result) => (
            <TableRow key={result.id} data-testid={`row-test-${result.id}`} className="hover-elevate">
              <TableCell className="font-medium">{result.testName}</TableCell>
              <TableCell>
                <TestStatusBadge status={result.status} />
              </TableCell>
              <TableCell>{result.duration}</TableCell>
              <TableCell className="text-muted-foreground">{result.timestamp}</TableCell>
              <TableCell className="text-muted-foreground">{result.browser}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRerun?.(result.id)}
                    data-testid={`button-rerun-${result.id}`}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails?.(result.id)}
                    data-testid={`button-view-${result.id}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
