import TestResultCard from '../TestResultCard';

export default function TestResultCardExample() {
  return (
    <div className="max-w-md">
      <TestResultCard
        testName="Login Flow Test"
        status="failed"
        duration="2.3s"
        timestamp="2 minutes ago"
        browser="Chrome 120"
        logs="Error: Element not found\n  at login.spec.ts:45\n  Expected button with text 'Sign In' to be visible"
        onRerun={() => console.log('Rerun test')}
        onViewDetails={() => console.log('View details')}
      />
    </div>
  );
}
