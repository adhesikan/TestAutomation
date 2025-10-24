import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TestStatusBadge, { TestStatus } from "./TestStatusBadge";
import { Play, Eye, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface TestResultCardProps {
  testName: string;
  status: TestStatus;
  duration?: string;
  timestamp: string;
  browser?: string;
  logs?: string;
  onRerun?: () => void;
  onViewDetails?: () => void;
}

export default function TestResultCard({
  testName,
  status,
  duration,
  timestamp,
  browser,
  logs,
  onRerun,
  onViewDetails,
}: TestResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card data-testid={`card-test-result-${testName.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base truncate">{testName}</CardTitle>
        </div>
        <TestStatusBadge status={status} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {duration && <span>Duration: {duration}</span>}
          <span>{timestamp}</span>
          {browser && <span>Browser: {browser}</span>}
        </div>

        {logs && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-start h-8"
              data-testid="button-toggle-logs"
            >
              {expanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
              {expanded ? 'Hide' : 'Show'} Logs
            </Button>
            {expanded && (
              <div className="bg-muted rounded-md p-3 text-xs font-mono overflow-auto max-h-48" data-testid="text-logs">
                <pre className="whitespace-pre-wrap">{logs}</pre>
              </div>
            )}
          </>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRerun}
            className="flex-1"
            data-testid="button-rerun-test"
          >
            <Play className="h-3 w-3 mr-2" />
            Rerun
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1"
            data-testid="button-view-details"
          >
            <Eye className="h-3 w-3 mr-2" />
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="button-download-report"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
