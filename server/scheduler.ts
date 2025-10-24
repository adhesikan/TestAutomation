import cron, { ScheduledTask } from 'node-cron';
import { storage } from './storage';
import { testExecutor } from './test-executor';

class TestScheduler {
  private scheduledTasks: Map<string, ScheduledTask> = new Map();

  isValidCronExpression(expression: string): boolean {
    return cron.validate(expression);
  }

  async initialize() {
    const schedules = await storage.getAllSchedules();
    
    for (const schedule of schedules) {
      if (schedule.enabled) {
        this.scheduleTest(schedule.id, schedule.testId, schedule.cronExpression);
      }
    }

    console.log(`Initialized ${schedules.filter(s => s.enabled).length} scheduled tests`);
  }

  scheduleTest(scheduleId: string, testId: string, cronExpression: string) {
    if (!cron.validate(cronExpression)) {
      console.error(`Invalid cron expression for schedule ${scheduleId}: ${cronExpression}`);
      return;
    }

    const existingTask = this.scheduledTasks.get(scheduleId);
    if (existingTask) {
      existingTask.stop();
    }

    const task = cron.schedule(cronExpression, async () => {
      try {
        const test = await storage.getTest(testId);
        if (test) {
          console.log(`Running scheduled test: ${test.name} (${testId})`);
          await testExecutor.executeTest(test);
        } else {
          console.warn(`Test ${testId} not found for schedule ${scheduleId}`);
        }
      } catch (error) {
        console.error(`Error executing scheduled test ${testId}:`, error);
      }
    });

    this.scheduledTasks.set(scheduleId, task);
    console.log(`Scheduled test ${testId} with cron: ${cronExpression}`);
  }

  unscheduleTest(scheduleId: string) {
    const task = this.scheduledTasks.get(scheduleId);
    if (task) {
      task.stop();
      this.scheduledTasks.delete(scheduleId);
      console.log(`Unscheduled test with schedule ID: ${scheduleId}`);
    }
  }

  rescheduleTest(scheduleId: string, testId: string, cronExpression: string) {
    this.unscheduleTest(scheduleId);
    this.scheduleTest(scheduleId, testId, cronExpression);
  }

  getAllScheduledTasks() {
    return Array.from(this.scheduledTasks.keys());
  }
}

export const testScheduler = new TestScheduler();
