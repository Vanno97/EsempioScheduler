import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema, categories } from "@shared/schema";
import { startReminderScheduler } from "./services/reminderScheduler";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Start the reminder scheduler
  startReminderScheduler();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all tasks (protected)
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      let tasks;
      if (startDate && endDate) {
        tasks = await storage.getTasksByDateRange(
          startDate as string, 
          endDate as string,
          userId
        );
      } else {
        tasks = await storage.getTasks(userId);
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get single task (protected)
  app.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Create task (protected)
  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedTask = insertTaskSchema.parse(req.body);
      
      // Check for conflicts
      const existingTasks = await storage.getTasksByDateRange(
        validatedTask.date, 
        validatedTask.date,
        userId
      );
      
      const conflict = checkTaskConflict(validatedTask, existingTasks);
      if (conflict) {
        return res.status(409).json({ 
          message: "Task conflicts with existing task", 
          conflictingTask: conflict 
        });
      }
      
      const task = await storage.createTask(validatedTask, userId);
      res.status(201).json(task);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update task (protected)
  app.put("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateTaskSchema.parse({ ...req.body, id });
      
      // Check for conflicts if time/date changed
      const userId = req.user.claims.sub;
      if (updateData.date || updateData.startTime || updateData.duration) {
        const existingTasks = await storage.getTasksByDateRange(
          updateData.date || '', 
          updateData.date || '',
          userId
        );
        
        // Filter out the current task being updated
        const otherTasks = existingTasks.filter(task => task.id !== id);
        
        const conflict = checkTaskConflict(updateData as any, otherTasks);
        if (conflict) {
          return res.status(409).json({ 
            message: "Task conflicts with existing task", 
            conflictingTask: conflict 
          });
        }
      }
      
      const task = await storage.updateTask(updateData);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete task (protected)
  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Get categories
  app.get("/api/categories", (req, res) => {
    res.json(categories);
  });

  const httpServer = createServer(app);
  return httpServer;
}

function checkTaskConflict(newTask: any, existingTasks: any[]): any | null {
  const newStart = timeToMinutes(newTask.startTime);
  const newEnd = newStart + newTask.duration;
  
  for (const task of existingTasks) {
    if (task.date === newTask.date) {
      const existingStart = timeToMinutes(task.startTime);
      const existingEnd = existingStart + task.duration;
      
      // Check for overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        return task;
      }
    }
  }
  
  return null;
}

function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}
