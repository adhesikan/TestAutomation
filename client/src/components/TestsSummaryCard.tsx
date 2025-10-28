import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface TestsSummaryCardProps {
  totalRuns: number;
  passed: number;
  failed: number;
  onClick?: () => void;
}

export default function TestsSummaryCard({ totalRuns, passed, failed, onClick }: TestsSummaryCardProps) {
  return (
    <Card 
      className="cursor-pointer hover-elevate active-elevate-2"
      onClick={onClick}
      data-testid="card-tests-summary"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">Tests Summary</p>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold" data-testid="text-total-runs">
              {totalRuns}
            </div>
            <div className="text-sm text-muted-foreground">total runs</div>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-chart-2" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground" data-testid="text-passed-count">{passed}</span> passed
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground" data-testid="text-failed-count">{failed}</span> failed
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Click to view detailed report
        </p>
      </CardContent>
    </Card>
  );
}
