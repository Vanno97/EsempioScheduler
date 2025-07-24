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

  // Funzione per ottenere l'appuntamento che inizia in un determinato slot
  const getTaskStartingInSlot = (date: string, timeSlot: string) => {
    const slotMinutes = timeToMinutes(timeSlot);
    const slotEndMinutes = slotMinutes + 30; // Slot di 30 minuti

    return filteredTasks.find(task => {
      if (task.date !== date) return false;
      
      const taskStartMinutes = timeToMinutes(task.startTime);
      // L'appuntamento inizia in questo slot se inizia tra l'inizio e la fine dello slot
      return taskStartMinutes >= slotMinutes && taskStartMinutes < slotEndMinutes;
    });
  };

  // Funzione per verificare se un appuntamento è in corso durante questo slot
  const isTaskContinuingInSlot = (date: string, timeSlot: string) => {
    const slotMinutes = timeToMinutes(timeSlot);
    const slotEndMinutes = slotMinutes + 30;

    return filteredTasks.some(task => {
      if (task.date !== date) return false;
      
      const taskStartMinutes = timeToMinutes(task.startTime);
      const taskEndMinutes = taskStartMinutes + task.duration;
      
      // L'appuntamento è in corso se inizia prima di questo slot e finisce dopo l'inizio
      return taskStartMinutes < slotMinutes && taskEndMinutes > slotMinutes;
    });
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  const calculateTaskHeight = (duration: number, startTime: string, slotTime: string) => {
    const taskStartMinutes = timeToMinutes(startTime);
    const slotStartMinutes = timeToMinutes(slotTime);
    
    // Se l'appuntamento inizia in questo slot
    if (taskStartMinutes >= slotStartMinutes && taskStartMinutes < slotStartMinutes + 30) {
      // Calcola quanti slot (30 min ciascuno) occuperà l'appuntamento
      const slotsNeeded = Math.ceil(duration / 30);
      return slotsNeeded * 64; // 64px per slot
    }
    
    return 64; // Altezza standard per slot
  };

  const calculateTaskPosition = (startTime: string, slotTime: string) => {
    const taskStartMinutes = timeToMinutes(startTime);
    const slotStartMinutes = timeToMinutes(slotTime);
    
    // Se l'appuntamento inizia in questo slot, calcola l'offset preciso
    if (taskStartMinutes >= slotStartMinutes && taskStartMinutes < slotStartMinutes + 30) {
      const minutesFromSlotStart = taskStartMinutes - slotStartMinutes;
      return (minutesFromSlotStart / 30) * 64; // Proporzione rispetto ai 30 minuti del slot
    }
    
    return 0;
  };

  const renderTask = (task: Task, slotTime: string) => {
    const backgroundColor = getCategoryColor(task.category);
    const height = calculateTaskHeight(task.duration, task.startTime, slotTime);
    const topOffset = calculateTaskPosition(task.startTime, slotTime);
    
    return (
      <div
        key={`${task.id}-${slotTime}`}
        onClick={(e) => {
          e.stopPropagation();
          onTaskClick(task);
        }}
        className="absolute left-1 right-1 text-white text-xs p-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow z-10"
        style={{ 
          backgroundColor,
          height: `${height}px`,
          top: `${topOffset}px`,
          minHeight: '32px'
        }}
      >
        <div className="font-medium truncate">{task.title}</div>
        <div className="opacity-90 text-xs">{formatTaskTime(task.startTime, task.duration)}</div>
        {task.description && (
          <div className="opacity-75 text-xs truncate mt-1">{task.description}</div>
        )}
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
              const taskStartingHere = getTaskStartingInSlot(day.fullDate, timeSlot.time);
              const isTaskContinuing = isTaskContinuingInSlot(day.fullDate, timeSlot.time);
              
              return (
                <div
                  key={`${day.fullDate}-${timeSlot.time}`}
                  onClick={() => onTimeSlotClick(day.fullDate, timeSlot.time)}
                  className={cn(
                    "border-r border-gray-200 last:border-r-0 p-1 relative cursor-pointer transition-colors",
                    day.isToday ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50",
                    isTaskContinuing && !taskStartingHere ? "bg-gray-100" : ""
                  )}
                  style={{ minHeight: '64px' }}
                >
                  {taskStartingHere && renderTask(taskStartingHere, timeSlot.time)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}