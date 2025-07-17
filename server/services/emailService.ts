import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set. Email functionality will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email sending skipped - no API key configured');
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@agenda.com',
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendTaskReminder(
  email: string, 
  taskTitle: string, 
  taskDate: string, 
  taskTime: string,
  reminderTime: string
): Promise<boolean> {
  const subject = `Reminder: ${taskTitle}`;
  const text = `This is a reminder for your upcoming task:

Task: ${taskTitle}
Date: ${taskDate}
Time: ${taskTime}

This reminder was set for ${reminderTime} before the task.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1A73E8;">Task Reminder</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${taskTitle}</h3>
        <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${taskDate}</p>
        <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${taskTime}</p>
      </div>
      <p style="color: #666; font-size: 14px;">
        This reminder was set for ${reminderTime} before the task.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@agenda.com',
    subject,
    text,
    html
  });
}
