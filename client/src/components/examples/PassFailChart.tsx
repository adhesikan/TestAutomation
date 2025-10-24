import PassFailChart from '../PassFailChart';

export default function PassFailChartExample() {
  const mockData = [
    { date: 'Mon', passed: 45, failed: 3 },
    { date: 'Tue', passed: 52, failed: 2 },
    { date: 'Wed', passed: 48, failed: 5 },
    { date: 'Thu', passed: 55, failed: 1 },
    { date: 'Fri', passed: 51, failed: 4 },
    { date: 'Sat', passed: 47, failed: 2 },
    { date: 'Sun', passed: 49, failed: 3 },
  ];

  return <PassFailChart data={mockData} />;
}
