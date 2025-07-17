import cron from 'node-cron';
import { storage } from '../storage';
import { sendTaskReminder } from './emailService';
import { format, parseISO, subMinutes, subHours, subDays } from 'date-fns';

function parseReminderTime(reminder: string): number {
  switch (reminder) {
    case '15min': return 15; // minutes
    case '1hour': return 60; // minutes
    case '1day': return 1440; // minutes in a day
    case '2days': return 2880; // minutes in 2 days
    default: return 0;
  }
}

function shouldSendReminder(taskDate: string, taskTime: string, reminder: string): boolean {
  try {
    const now = new Date();
    const taskDateTime = parseISO(`${taskDate}T${taskTime}:00`);
    const reminderMinutes = parseReminderTime(reminder);
    
    if (reminderMinutes === 0) return false;
    
    const reminderTime = subMinutes(taskDateTime, reminderMinutes);
    
    // Send reminder if current time is past reminder time but before task time
    return now >= reminderTime && now < taskDateTime;
  } catch (error) {
    console.error('Error checking reminder time:', error);
    return false;
  }
}

export function startReminderScheduler() {
  // Check for reminders every minute
  cron.schedule('* * * * *', async () => {
    try {
      const tasks = await storage.getTasksForReminders();
      
      for (const task of tasks) {
        if (shouldSendReminder(task.date, task.startTime, task.reminder!)) {
          console.log(`Sending reminder for task: ${task.title}`);
          
          const reminderTimeText = {
            '15min': '15 minutes',
            '1hour': '1 hour',
            '1day': '1 day',
            '2days': '2 days'
          }[task.reminder!] || task.reminder!;
          
          const success = await sendTaskReminder(
            task.email!,
            task.title,
            task.date,
            task.startTime,
            reminderTimeText
          );
          
          if (success) {
            await storage.markReminderSent(task.id);
            console.log(`Reminder sent successfully for task: ${task.title}`);
          } else {
            console.error(`Failed to send reminder for task: ${task.title}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });

  console.log('Reminder scheduler started - checking every minute');
}
