import MetricsCard from '../MetricsCard';
import { CheckCircle2 } from 'lucide-react';

export default function MetricsCardExample() {
  return (
    <MetricsCard 
      title="Pass Rate"
      value="94.2%"
      subtitle="Last 24 hours"
      icon={CheckCircle2}
      trend={{ value: '2.1% from yesterday', positive: true }}
    />
  );
}
