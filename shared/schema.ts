import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const jiraSettings = pgTable("jira_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jiraUrl: text("jira_url").notNull(),
  apiToken: text("api_token").notNull(),
  userEmail: text("user_email").notNull(),
  scheduleTime: text("schedule_time").default("09:00"),
  timezone: text("timezone").default("UTC"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assignees = pgTable("assignees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assigneeId: text("assignee_id").notNull().unique(),
  name: text("name"),
  email: text("email"),
  group: text("group"), // PJ, AG, LOS, or null for user-added
  isPreconfigured: boolean("is_preconfigured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const worklogEntries = pgTable("worklog_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assigneeId: text("assignee_id").notNull(),
  assigneeName: text("assignee_name"),
  taskKey: text("task_key").notNull(),
  taskSummary: text("task_summary"),
  taskStatus: text("task_status"),
  hoursLogged: text("hours_logged").notNull(), // Store as string like "2.5h"
  worklogDate: text("worklog_date").notNull(), // Store as YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJiraSettingsSchema = createInsertSchema(jiraSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssigneeSchema = createInsertSchema(assignees).omit({
  id: true,
  createdAt: true,
});

export const insertWorklogEntrySchema = createInsertSchema(worklogEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertJiraSettings = z.infer<typeof insertJiraSettingsSchema>;
export type InsertAssignee = z.infer<typeof insertAssigneeSchema>;
export type InsertWorklogEntry = z.infer<typeof insertWorklogEntrySchema>;

export type JiraSettings = typeof jiraSettings.$inferSelect;
export type Assignee = typeof assignees.$inferSelect;
export type WorklogEntry = typeof worklogEntries.$inferSelect;

// Frontend-only types for API responses
export type DashboardData = {
  totalHours: string;
  activeAssignees: number;
  tasksWorked: number;
  worklogDate: string;
  selectedGroup: string | null;
  assigneeWorklogs: Array<{
    assigneeId: string;
    name: string;
    email: string;
    initials: string;
    tasksCount: number;
    hoursLogged: string;
    progressPercent: number;
    status: 'Active' | 'Inactive';
    group?: string;
    isPreconfigured?: boolean;
  }>;
  tasks: Array<{
    key: string;
    summary: string;
    status: string;
    assignee: string;
    worklogHours: string;
  }>;
};
