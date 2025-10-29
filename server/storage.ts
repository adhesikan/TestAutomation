import { 
  type Test, 
  type InsertTest,
  type TestRun,
  type InsertTestRun,
  type Schedule,
  type InsertSchedule,
  type UserDataset,
  type InsertUserDataset,
  tests,
  testRuns,
  schedules,
  userDatasets,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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

  // User dataset operations
  getUserDataset(id: string): Promise<UserDataset | undefined>;
  getAllUserDatasets(): Promise<UserDataset[]>;
  createUserDataset(dataset: InsertUserDataset): Promise<UserDataset>;
  deleteUserDataset(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private tests: Map<string, Test>;
  private testRuns: Map<string, TestRun>;
  private schedules: Map<string, Schedule>;
  private userDatasets: Map<string, UserDataset>;

  constructor() {
    this.tests = new Map();
    this.testRuns = new Map();
    this.schedules = new Map();
    this.userDatasets = new Map();
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

  // User dataset operations
  async getUserDataset(id: string): Promise<UserDataset | undefined> {
    return this.userDatasets.get(id);
  }

  async getAllUserDatasets(): Promise<UserDataset[]> {
    return Array.from(this.userDatasets.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createUserDataset(insertDataset: InsertUserDataset): Promise<UserDataset> {
    const id = randomUUID();
    const dataset: UserDataset = { 
      id,
      description: insertDataset.description,
      steps: insertDataset.steps as string[],
      variables: insertDataset.variables ?? null,
      createdAt: new Date(),
      source: insertDataset.source ?? "manual",
    };
    this.userDatasets.set(id, dataset);
    return dataset;
  }

  async deleteUserDataset(id: string): Promise<boolean> {
    return this.userDatasets.delete(id);
  }
}

export class DbStorage implements IStorage {
  // Test operations
  async getTest(id: string): Promise<Test | undefined> {
    const result = await db.select().from(tests).where(eq(tests.id, id)).limit(1);
    return result[0];
  }

  async getAllTests(): Promise<Test[]> {
    return await db.select().from(tests);
  }

  async createTest(insertTest: InsertTest): Promise<Test> {
    const id = randomUUID();
    const result = await db.insert(tests).values({ 
      ...insertTest, 
      id,
      headless: insertTest.headless ?? true,
      screenshotOnFail: insertTest.screenshotOnFail ?? true,
    }).returning();
    return result[0];
  }

  async updateTest(id: string, testUpdate: Partial<InsertTest>): Promise<Test | undefined> {
    const result = await db.update(tests)
      .set(testUpdate)
      .where(eq(tests.id, id))
      .returning();
    return result[0];
  }

  async deleteTest(id: string): Promise<boolean> {
    const result = await db.delete(tests).where(eq(tests.id, id)).returning();
    return result.length > 0;
  }

  // Test run operations
  async getTestRun(id: string): Promise<TestRun | undefined> {
    const result = await db.select().from(testRuns).where(eq(testRuns.id, id)).limit(1);
    return result[0];
  }

  async getTestRunsByTestId(testId: string): Promise<TestRun[]> {
    return await db.select()
      .from(testRuns)
      .where(eq(testRuns.testId, testId))
      .orderBy(desc(testRuns.startedAt));
  }

  async getAllTestRuns(limit?: number): Promise<TestRun[]> {
    const query = db.select().from(testRuns).orderBy(desc(testRuns.startedAt));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async createTestRun(insertTestRun: InsertTestRun): Promise<TestRun> {
    const id = randomUUID();
    const result = await db.insert(testRuns).values({ 
      ...insertTestRun, 
      id,
      duration: insertTestRun.duration ?? null,
      completedAt: insertTestRun.completedAt ?? null,
      logs: insertTestRun.logs ?? null,
      screenshot: insertTestRun.screenshot ?? null,
      errorMessage: insertTestRun.errorMessage ?? null,
    }).returning();
    return result[0];
  }

  async updateTestRun(id: string, testRunUpdate: Partial<InsertTestRun>): Promise<TestRun | undefined> {
    const result = await db.update(testRuns)
      .set(testRunUpdate)
      .where(eq(testRuns.id, id))
      .returning();
    return result[0];
  }

  // Schedule operations
  async getSchedule(id: string): Promise<Schedule | undefined> {
    const result = await db.select().from(schedules).where(eq(schedules.id, id)).limit(1);
    return result[0];
  }

  async getSchedulesByTestId(testId: string): Promise<Schedule[]> {
    return await db.select()
      .from(schedules)
      .where(eq(schedules.testId, testId));
  }

  async getAllSchedules(): Promise<Schedule[]> {
    return await db.select().from(schedules);
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = randomUUID();
    const result = await db.insert(schedules).values({ 
      ...insertSchedule, 
      id,
      enabled: insertSchedule.enabled ?? true,
    }).returning();
    return result[0];
  }

  async updateSchedule(id: string, scheduleUpdate: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const result = await db.update(schedules)
      .set(scheduleUpdate)
      .where(eq(schedules.id, id))
      .returning();
    return result[0];
  }

  async deleteSchedule(id: string): Promise<boolean> {
    const result = await db.delete(schedules).where(eq(schedules.id, id)).returning();
    return result.length > 0;
  }

  // User dataset operations
  async getUserDataset(id: string): Promise<UserDataset | undefined> {
    const result = await db.select().from(userDatasets).where(eq(userDatasets.id, id)).limit(1);
    return result[0];
  }

  async getAllUserDatasets(): Promise<UserDataset[]> {
    return await db.select().from(userDatasets).orderBy(desc(userDatasets.createdAt));
  }

  async createUserDataset(insertDataset: InsertUserDataset): Promise<UserDataset> {
    const result = await db.insert(userDatasets).values(insertDataset as any).returning();
    return result[0];
  }

  async deleteUserDataset(id: string): Promise<boolean> {
    const result = await db.delete(userDatasets).where(eq(userDatasets.id, id)).returning();
    return result.length > 0;
  }
}

// Use database storage instead of in-memory storage
export const storage = new DbStorage();
