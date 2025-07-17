import { Task } from '@shared/schema';
import { formatTaskTime } from './dateUtils';

export function exportToICS(tasks: Task[]): void {
  const icsContent = generateICSContent(tasks);
  downloadFile(icsContent, 'agenda.ics', 'text/calendar');
}

export function exportToCSV(tasks: Task[]): void {
  const csvContent = generateCSVContent(tasks);
  downloadFile(csvContent, 'agenda.csv', 'text/csv');
}

function generateICSContent(tasks: Task[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Weekly Agenda//EN',
    'CALSCALE:GREGORIAN'
  ];

  tasks.forEach(task => {
    const startDateTime = `${task.date.replace(/-/g, '')}T${task.startTime.replace(':', '')}00`;
    const endMinutes = timeToMinutes(task.startTime) + task.duration;
    const endTime = minutesToTime(endMinutes);
    const endDateTime = `${task.date.replace(/-/g, '')}T${endTime.replace(':', '')}00`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${task.id}@agenda.local`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `SUMMARY:${task.title}`,
      `DESCRIPTION:${task.description || ''}`,
      `CATEGORIES:${task.category}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function generateCSVContent(tasks: Task[]): string {
  const headers = ['Title', 'Description', 'Date', 'Start Time', 'Duration (min)', 'Category', 'Reminder'];
  const rows = tasks.map(task => [
    `"${task.title.replace(/"/g, '""')}"`,
    `"${(task.description || '').replace(/"/g, '""')}"`,
    task.date,
    task.startTime,
    task.duration.toString(),
    task.category,
    task.reminder || ''
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
