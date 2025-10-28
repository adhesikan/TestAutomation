import { chromium, firefox, webkit, Browser, Page } from 'playwright';
import type { Test, InsertTestRun } from '@shared/schema';
import { storage } from './storage';
import { EventEmitter } from 'events';

export type TestExecutorEvents = {
  'log': (runId: string, message: string) => void;
  'progress': (runId: string, progress: number) => void;
  'complete': (runId: string, success: boolean) => void;
};

export class TestExecutor extends EventEmitter {
  private runningTests: Map<string, boolean> = new Map();

  async executeTest(test: Test): Promise<string> {
    const startedAt = new Date();
    
    const testRun = await storage.createTestRun({
      testId: test.id,
      status: 'running',
      startedAt,
      duration: null,
      completedAt: null,
      logs: '',
      screenshot: null,
      errorMessage: null,
    });

    this.runningTests.set(testRun.id, true);
    
    this.executeTestAsync(test, testRun.id, startedAt).catch(error => {
      console.error('Test execution error:', error);
    });

    return testRun.id;
  }

  private async executeTestAsync(test: Test, runId: string, startedAt: Date) {
    let browser: Browser | null = null;
    let page: Page | null = null;
    const logs: string[] = [];

    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      const logMessage = `[${timestamp}] ${message}`;
      logs.push(logMessage);
      this.emit('log', runId, logMessage);
    };

    try {
      addLog(`Starting test: ${test.name}`);
      addLog(`Target URL: ${test.url}`);
      addLog(`Browser: ${test.browser}`);

      const browserType = test.browser === 'firefox' ? firefox : 
                         test.browser === 'webkit' ? webkit : 
                         chromium;

      browser = await browserType.launch({ 
        headless: test.headless 
      });
      addLog('Browser launched successfully');

      page = await browser.newPage();
      addLog('New page created');

      await page.goto(test.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      addLog(`Navigated to ${test.url}`);

      if (test.testScript) {
        addLog('Executing test script...');
        const scriptLines = test.testScript.split('\n').filter(line => line.trim());
        
        for (let i = 0; i < scriptLines.length; i++) {
          const line = scriptLines[i].trim();
          if (!line || line.startsWith('//')) continue;

          const progress = Math.round(((i + 1) / scriptLines.length) * 100);
          this.emit('progress', runId, progress);

          addLog(`Executing: ${line}`);
          
          try {
            await this.executeScriptLine(page, line);
            addLog(`✓ Step completed`);
          } catch (error: any) {
            throw new Error(`Failed at step: ${line}\n${error.message}`);
          }
        }
      }

      const completedAt = new Date();
      const duration = completedAt.getTime() - startedAt.getTime();

      addLog('✓ Test passed successfully');
      
      await storage.updateTestRun(runId, {
        status: 'passed',
        duration,
        completedAt,
        logs: logs.join('\n'),
      });

      this.emit('complete', runId, true);

    } catch (error: any) {
      const completedAt = new Date();
      const duration = completedAt.getTime() - startedAt.getTime();
      
      addLog(`✗ Test failed: ${error.message}`);
      
      let screenshot: string | null = null;
      if (test.screenshotOnFail && page) {
        try {
          const buffer = await page.screenshot();
          screenshot = buffer.toString('base64');
          addLog('Screenshot captured on failure');
        } catch (screenshotError) {
          addLog('Failed to capture screenshot');
        }
      }

      await storage.updateTestRun(runId, {
        status: 'failed',
        duration,
        completedAt,
        logs: logs.join('\n'),
        errorMessage: error.message,
        screenshot,
      });

      this.emit('complete', runId, false);

    } finally {
      if (browser) {
        await browser.close();
        addLog('Browser closed');
      }
      this.runningTests.delete(runId);
    }
  }

  private async executeScriptLine(page: Page, line: string) {
    const clickMatch = line.match(/^click\s+(.+)$/i);
    if (clickMatch) {
      await page.click(clickMatch[1]);
      return;
    }

    const typeMatch = line.match(/^type\s+(.+?)\s+"(.+)"$/i);
    if (typeMatch) {
      await page.fill(typeMatch[1], typeMatch[2]);
      return;
    }

    const waitMatch = line.match(/^wait\s+(\d+)$/i);
    if (waitMatch) {
      await page.waitForTimeout(parseInt(waitMatch[1]));
      return;
    }

    const expectMatch = line.match(/^expect\s+(.+)$/i);
    if (expectMatch) {
      await page.waitForSelector(expectMatch[1], { timeout: 5000 });
      return;
    }

    const gotoMatch = line.match(/^goto\s+(.+)$/i);
    if (gotoMatch) {
      await page.goto(gotoMatch[1], { waitUntil: 'networkidle' });
      return;
    }

    const selectMatch = line.match(/^select\s+(.+?)\s+"(.+)"$/i);
    if (selectMatch) {
      const selector = selectMatch[1];
      const option = selectMatch[2];
      
      // Try to select by label first (visible text), then fall back to value
      try {
        await page.selectOption(selector, { label: option });
      } catch {
        await page.selectOption(selector, option);
      }
      return;
    }

    throw new Error(`Unknown command: ${line}`);
  }

  isTestRunning(runId: string): boolean {
    return this.runningTests.get(runId) || false;
  }

  async stopTest(runId: string): Promise<boolean> {
    if (this.runningTests.has(runId)) {
      this.runningTests.set(runId, false);
      await storage.updateTestRun(runId, {
        status: 'stopped',
        completedAt: new Date(),
      });
      return true;
    }
    return false;
  }
}

export const testExecutor = new TestExecutor();
