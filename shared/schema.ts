import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  reminderSent: true,
  userId: true,
  createdAt: true,
}).extend({
  email: z.string().optional(),
});

export const updateTaskSchema = insertTaskSchema.partial().extend({
  id: z.number(),
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
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
