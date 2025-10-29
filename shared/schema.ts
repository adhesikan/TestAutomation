import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const tests = pgTable("tests", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  browser: text("browser").notNull(),
  headless: boolean("headless").notNull().default(true),
  screenshotOnFail: boolean("screenshot_on_fail").notNull().default(true),
  testScript: text("test_script").notNull(),
});

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
});

export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof tests.$inferSelect;

export const testRuns = pgTable("test_runs", {
  id: varchar("id").primaryKey(),
  testId: varchar("test_id").notNull(),
  status: text("status").notNull(),
  duration: integer("duration"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  logs: text("logs"),
  screenshot: text("screenshot"),
  errorMessage: text("error_message"),
});

export const insertTestRunSchema = createInsertSchema(testRuns).omit({
  id: true,
});

export type InsertTestRun = z.infer<typeof insertTestRunSchema>;
export type TestRun = typeof testRuns.$inferSelect;

export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey(),
  testId: varchar("test_id").notNull(),
  cronExpression: text("cron_expression").notNull(),
  enabled: boolean("enabled").notNull().default(true),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

export const userDatasets = pgTable("user_datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  steps: json("steps").$type<string[]>().notNull(),
  variables: json("variables").$type<Record<string, string>>(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  source: text("source").notNull().default("manual"), // 'manual' or 'learning'
});

export const insertUserDatasetSchema = createInsertSchema(userDatasets).omit({
  id: true,
  createdAt: true,
});

export type InsertUserDataset = z.infer<typeof insertUserDatasetSchema>;
export type UserDataset = typeof userDatasets.$inferSelect;

// Variable extraction types
export const extractedVariablesSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
  login_url: z.string().url().optional(),
  strategy_type: z.string().optional(),
  provider_name: z.string().optional(),
  ticker: z.string().optional(),
  signal_type: z.string().optional(),
  amount: z.string().optional(),
  other: z.record(z.string()).optional(),
});

export type ExtractedVariables = z.infer<typeof extractedVariablesSchema>;
