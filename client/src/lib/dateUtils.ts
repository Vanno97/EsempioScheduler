import { format, startOfWeek, addDays, parseISO, addWeeks, subWeeks } from 'date-fns';
import { it } from 'date-fns/locale';

export function getCurrentWeekDates(currentDate: Date = new Date()) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i);
    weekDays.push({
      date: date,
      dayName: format(date, 'EEE', { locale: it }),
      dayNumber: format(date, 'd'),
      fullDate: format(date, 'yyyy-MM-dd'),
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    });
  }
  
  return weekDays;
}

export function getWeekRange(currentDate: Date = new Date()) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = addDays(startDate, 6);
  
  return {
    start: format(startDate, 'yyyy-MM-dd'),
    end: format(endDate, 'yyyy-MM-dd'),
    label: `${format(startDate, 'MMM d', { locale: it })}-${format(endDate, 'd, yyyy', { locale: it })}`
  };
}

export function getNextWeek(currentDate: Date): Date {
  return addWeeks(currentDate, 1);
}

export function getPreviousWeek(currentDate: Date): Date {
  return subWeeks(currentDate, 1);
}

export function getTimeSlots() {
  const slots = [];
  for (let hour = 6; hour <= 23; hour++) {
    // Creiamo slot ogni 30 minuti per una migliore granularità
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const display = format(parseISO(`2000-01-01T${time}:00`), 'HH:mm');
      slots.push({ time, display });
    }
  }
  return slots;
}

export function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function formatTaskTime(startTime: string, duration: number): string {
  const start = format(parseISO(`2000-01-01T${startTime}:00`), 'HH:mm');
  const endMinutes = timeToMinutes(startTime) + duration;
  const end = format(parseISO(`2000-01-01T${minutesToTime(endMinutes)}:00`), 'HH:mm');
  return `${start} - ${end}`;
}
