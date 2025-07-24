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

// User storage table with traditional auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(), // Will store hashed passwords
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  userId: integer("user_id").notNull().references(() => users.id),
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username è richiesto"),
  password: z.string().min(1, "Password è richiesta"),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password deve essere almeno 6 caratteri"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
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
