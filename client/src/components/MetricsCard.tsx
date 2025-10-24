import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export default function MetricsCard({ title, value, subtitle, icon: Icon, trend }: MetricsCardProps) {
  return (
    <Card data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={`text-metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className={`text-xs mt-2 ${trend.positive ? 'text-chart-2' : 'text-destructive'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
