import { Task, categories } from "@shared/schema";
import { getCurrentWeekDates, getTimeSlots, formatTaskTime, timeToMinutes } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  currentDate: Date;
  tasks: Task[];
  selectedCategories: string[];
  onTimeSlotClick: (date: string, time: string) => void;
  onTaskClick: (task: Task) => void;
}

export function CalendarGrid({
  currentDate,
  tasks,
  selectedCategories,
  onTimeSlotClick,
  onTaskClick
}: CalendarGridProps) {
  const weekDays = getCurrentWeekDates(currentDate);
  const timeSlots = getTimeSlots();

  const filteredTasks = tasks.filter(task => 
    selectedCategories.includes(task.category)
  );

  const getTasksForSlot = (date: string, time: string) => {
    const slotMinutes = timeToMinutes(time);

    return filteredTasks.filter(task => {
      if (task.date !== date) {
        return false;
      }

      const taskStartMinutes = timeToMinutes(task.startTime);

      // Solo mostra il task nello slot dove inizia
      return taskStartMinutes === slotMinutes;
    });
  };

  const calculateTaskHeight = (duration: number) => {
    // Ogni slot è 60 minuti, calcoliamo l'altezza proporzionale
    const slotsNeeded = duration / 60;
    return Math.max(slotsNeeded * 64, 32); // 64px per slot, minimo 32px
  };

  const calculateTaskPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startHour = hours;
    const minuteOffset = (minutes / 60) * 64; // 64px per ora
    return minuteOffset;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  const renderTask = (task: Task) => {
    const backgroundColor = getCategoryColor(task.category);
    const taskHeight = calculateTaskHeight(task.duration);
    const topOffset = calculateTaskPosition(task.startTime);

    return (
      <div
        key={task.id}
        onClick={(e) => {
          e.stopPropagation();
          onTaskClick(task);
        }}
        className="absolute left-1 right-1 text-white text-xs p-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow z-10"
        style={{ 
          backgroundColor,
          height: `${taskHeight}px`,
          top: `${topOffset}px`,
          minHeight: '32px'
        }}
      >
        <div className="font-medium truncate">{task.title}</div>
        <div className="opacity-90 text-xs">{formatTaskTime(task.startTime, task.duration)}</div>
      </div>
    );
  };

  return (
    <main className="flex-1 bg-white">
      {/* Calendar Header */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="border-r border-gray-200 p-4"></div>
        {weekDays.map(day => (
          <div key={day.fullDate} className="p-4 text-center border-r border-gray-200 last:border-r-0">
            <div className={cn(
              "text-xs font-medium uppercase tracking-wide",
              day.isToday ? "text-blue-600" : "text-gray-500"
            )}>
              {day.dayName}
            </div>
            <div className={cn(
              "text-lg font-semibold mt-1",
              day.isToday ? "text-blue-600" : "text-gray-900"
            )}>
              {day.dayNumber}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="overflow-auto h-[calc(100vh-200px)]">
        {timeSlots.map(timeSlot => (
          <div key={timeSlot.time} className="grid grid-cols-8 border-b border-gray-100 min-h-16">
            <div className="border-r border-gray-200 p-2 text-right">
              <span className="text-xs text-gray-500">{timeSlot.display}</span>
            </div>

            {weekDays.map(day => {
              const dayTasks = getTasksForSlot(day.fullDate, timeSlot.time);

              return (
                <div
                  key={`${day.fullDate}-${timeSlot.time}`}
                  onClick={() => onTimeSlotClick(day.fullDate, timeSlot.time)}
                  className={cn(
                    "border-r border-gray-200 last:border-r-0 p-1 relative cursor-pointer transition-colors",
                    day.isToday ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                  )}
                  style={{ minHeight: '64px' }}
                >
                  {dayTasks.map(task => renderTask(task))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}