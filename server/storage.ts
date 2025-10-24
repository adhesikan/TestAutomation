import { 
  type Test, 
  type InsertTest,
  type TestRun,
  type InsertTestRun,
  type Schedule,
  type InsertSchedule,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Test operations
  getTest(id: string): Promise<Test | undefined>;
  getAllTests(): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  updateTest(id: string, test: Partial<InsertTest>): Promise<Test | undefined>;
  deleteTest(id: string): Promise<boolean>;

  // Test run operations
  getTestRun(id: string): Promise<TestRun | undefined>;
  getTestRunsByTestId(testId: string): Promise<TestRun[]>;
  getAllTestRuns(limit?: number): Promise<TestRun[]>;
  createTestRun(testRun: InsertTestRun): Promise<TestRun>;
  updateTestRun(id: string, testRun: Partial<InsertTestRun>): Promise<TestRun | undefined>;

  // Schedule operations
  getSchedule(id: string): Promise<Schedule | undefined>;
  getSchedulesByTestId(testId: string): Promise<Schedule[]>;
  getAllSchedules(): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: string, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private tests: Map<string, Test>;
  private testRuns: Map<string, TestRun>;
  private schedules: Map<string, Schedule>;

  constructor() {
    this.tests = new Map();
    this.testRuns = new Map();
    this.schedules = new Map();
  }

  // Test operations
  async getTest(id: string): Promise<Test | undefined> {
    return this.tests.get(id);
  }

  async getAllTests(): Promise<Test[]> {
    return Array.from(this.tests.values());
  }

  async createTest(insertTest: InsertTest): Promise<Test> {
    const id = randomUUID();
    const test: Test = { 
      ...insertTest, 
      id,
      headless: insertTest.headless ?? true,
      screenshotOnFail: insertTest.screenshotOnFail ?? true,
    };
    this.tests.set(id, test);
    return test;
  }

  async updateTest(id: string, testUpdate: Partial<InsertTest>): Promise<Test | undefined> {
    const existing = this.tests.get(id);
    if (!existing) return undefined;
    
    const updated: Test = { ...existing, ...testUpdate };
    this.tests.set(id, updated);
    return updated;
  }

  async deleteTest(id: string): Promise<boolean> {
    return this.tests.delete(id);
  }

  // Test run operations
  async getTestRun(id: string): Promise<TestRun | undefined> {
    return this.testRuns.get(id);
  }

  async getTestRunsByTestId(testId: string): Promise<TestRun[]> {
    return Array.from(this.testRuns.values())
      .filter(run => run.testId === testId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  async getAllTestRuns(limit?: number): Promise<TestRun[]> {
    const runs = Array.from(this.testRuns.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    return limit ? runs.slice(0, limit) : runs;
  }

  async createTestRun(insertTestRun: InsertTestRun): Promise<TestRun> {
    const id = randomUUID();
    const testRun: TestRun = { 
      ...insertTestRun, 
      id,
      duration: insertTestRun.duration ?? null,
      completedAt: insertTestRun.completedAt ?? null,
      logs: insertTestRun.logs ?? null,
      screenshot: insertTestRun.screenshot ?? null,
      errorMessage: insertTestRun.errorMessage ?? null,
    };
    this.testRuns.set(id, testRun);
    return testRun;
  }

  async updateTestRun(id: string, testRunUpdate: Partial<InsertTestRun>): Promise<TestRun | undefined> {
    const existing = this.testRuns.get(id);
    if (!existing) return undefined;
    
    const updated: TestRun = { ...existing, ...testRunUpdate };
    this.testRuns.set(id, updated);
    return updated;
  }

  // Schedule operations
  async getSchedule(id: string): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }

  async getSchedulesByTestId(testId: string): Promise<Schedule[]> {
    return Array.from(this.schedules.values())
      .filter(schedule => schedule.testId === testId);
  }

  async getAllSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values());
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = randomUUID();
    const schedule: Schedule = { 
      ...insertSchedule, 
      id,
      enabled: insertSchedule.enabled ?? true,
    };
    this.schedules.set(id, schedule);
    return schedule;
  }

  async updateSchedule(id: string, scheduleUpdate: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const existing = this.schedules.get(id);
    if (!existing) return undefined;
    
    const updated: Schedule = { ...existing, ...scheduleUpdate };
    this.schedules.set(id, updated);
    return updated;
  }

  async deleteSchedule(id: string): Promise<boolean> {
    return this.schedules.delete(id);
  }
}

export const storage = new MemStorage();
