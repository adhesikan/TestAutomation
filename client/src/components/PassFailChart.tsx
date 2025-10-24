import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartData {
  date: string;
  passed: number;
  failed: number;
}

interface PassFailChartProps {
  data: ChartData[];
}

export default function PassFailChart({ data }: PassFailChartProps) {
  return (
    <Card data-testid="card-passfail-chart">
      <CardHeader>
        <CardTitle>Test Results Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              className="text-xs text-muted-foreground"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs text-muted-foreground"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="passed" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              name="Passed"
            />
            <Line 
              type="monotone" 
              dataKey="failed" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name="Failed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
