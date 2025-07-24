import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:mm format
  duration: integer("duration").notNull(), // minutes
  category: text("category").notNull(),
  reminder: text("reminder"), // 15min, 1hour, 1day, 2days
  email: text("email"), // email for reminders
  reminderSent: boolean("reminder_sent").default(false),
  userId: integer("user_id"), // for future user support
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  reminderSent: true,
}).extend({
  email: z.string().email().optional(),
});

export const updateTaskSchema = insertTaskSchema.partial().extend({
  id: z.number(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const categories = [
  { id: 'work', name: 'Lavoro', color: 'hsl(291, 64%, 42%)' },
  { id: 'personal', name: 'Personale', color: 'hsl(122, 39%, 49%)' },
  { id: 'health', name: 'Salute', color: 'hsl(33, 100%, 50%)' },
  { id: 'urgent', name: 'Urgente', color: 'hsl(4, 90%, 58%)' },
] as const;

export type CategoryId = typeof categories[number]['id'];
