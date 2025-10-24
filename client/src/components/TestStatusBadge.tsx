import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Loader2, MinusCircle } from "lucide-react";

export type TestStatus = 'passed' | 'failed' | 'running' | 'scheduled' | 'skipped';

interface TestStatusBadgeProps {
  status: TestStatus;
  className?: string;
}

const statusConfig = {
  passed: {
    label: 'Passed',
    icon: CheckCircle2,
    className: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  running: {
    label: 'Running',
    icon: Loader2,
    className: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  },
  scheduled: {
    label: 'Scheduled',
    icon: Clock,
    className: 'bg-muted text-muted-foreground border-border',
  },
  skipped: {
    label: 'Skipped',
    icon: MinusCircle,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export default function TestStatusBadge({ status, className = '' }: TestStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${className}`}
      data-testid={`badge-status-${status}`}
    >
      <Icon className={`h-3 w-3 mr-1 ${status === 'running' ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}
