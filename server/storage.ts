import { tasks, users, type Task, type InsertTask, type UpdateTask, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  getTasksByDateRange(startDate: string, endDate: string, userId: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(insertTask: InsertTask, userId: string): Promise<Task>;
  updateTask(updateTask: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksForReminders(): Promise<Task[]>;
  markReminderSent(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTasksByDateRange(startDate: string, endDate: string, userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(
      and(
        eq(tasks.userId, userId),
        gte(tasks.date, startDate),
        lte(tasks.date, endDate)
      )
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask, userId: string): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        userId,
        reminderSent: false,
      })
      .returning();
    return task;
  }

  async updateTask(updateTask: UpdateTask): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updateTask)
      .where(eq(tasks.id, updateTask.id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getTasksForReminders(): Promise<Task[]> {
    return await db.select().from(tasks).where(
      and(
        eq(tasks.reminderSent, false),
        // Add conditions for reminder timing if needed
      )
    );
  }

  async markReminderSent(id: number): Promise<void> {
    await db
      .update(tasks)
      .set({ reminderSent: true })
      .where(eq(tasks.id, id));
  }
}

export const storage = new DatabaseStorage();