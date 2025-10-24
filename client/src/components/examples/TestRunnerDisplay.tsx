import TestRunnerDisplay from '../TestRunnerDisplay';

export default function TestRunnerDisplayExample() {
  const mockLogs = [
    '[10:30:45] Starting test suite: Authentication',
    '[10:30:46] Running test: Login with valid credentials',
    '[10:30:47] ✓ User navigated to login page',
    '[10:30:48] ✓ Email input filled',
    '[10:30:49] ✓ Password input filled',
    '[10:30:50] ✓ Submit button clicked',
    '[10:30:52] ✓ Redirected to dashboard',
    '[10:30:52] Test passed: Login with valid credentials',
    '[10:30:53] Running test: Login with invalid credentials',
  ];

  return (
    <TestRunnerDisplay
      currentTest="Login with invalid credentials"
      progress={65}
      logs={mockLogs}
      onPause={() => console.log('Pause clicked')}
      onStop={() => console.log('Stop clicked')}
    />
  );
}
