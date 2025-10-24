import TestStatusBadge from '../TestStatusBadge';

export default function TestStatusBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap">
      <TestStatusBadge status="passed" />
      <TestStatusBadge status="failed" />
      <TestStatusBadge status="running" />
      <TestStatusBadge status="scheduled" />
      <TestStatusBadge status="skipped" />
    </div>
  );
}
