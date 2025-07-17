import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { getWeekRange, getNextWeek, getPreviousWeek } from "@/lib/dateUtils";
import { exportToICS, exportToCSV } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { CalendarGrid } from "@/components/CalendarGrid";
import { TaskModal } from "@/components/TaskModal";

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategories, setSelectedCategories] = useState(['work', 'personal', 'health', 'urgent']);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>("");
  const [defaultTime, setDefaultTime] = useState<string>("");
  
  const { toast } = useToast();

  const weekRange = getWeekRange(currentDate);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks', weekRange.start, weekRange.end],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?startDate=${weekRange.start}&endDate=${weekRange.end}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    }
  });

  const handlePreviousWeek = () => {
    setCurrentDate(getPreviousWeek(currentDate));
  };

  const handleNextWeek = () => {
    setCurrentDate(getNextWeek(currentDate));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setDefaultDate("");
    setDefaultTime("");
    setIsTaskModalOpen(true);
  };

  const handleTimeSlotClick = (date: string, time: string) => {
    setSelectedTask(null);
    setDefaultDate(date);
    setDefaultTime(time);
    setIsTaskModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDefaultDate("");
    setDefaultTime("");
    setIsTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    setDefaultDate("");
    setDefaultTime("");
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleExportICS = () => {
    try {
      exportToICS(tasks);
      toast({ title: "Calendario esportato con successo" });
    } catch (error) {
      toast({ 
        title: "Esportazione fallita", 
        description: "Impossibile esportare il calendario",
        variant: "destructive" 
      });
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(tasks);
      toast({ title: "Attività esportate con successo" });
    } catch (error) {
      toast({ 
        title: "Esportazione fallita", 
        description: "Impossibile esportare le attività",
        variant: "destructive" 
      });
    }
  };

  const taskCounts = tasks.reduce((counts, task) => {
    counts[task.category] = (counts[task.category] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Caricamento calendario...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header
        currentWeekLabel={weekRange.label}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        onNewTask={handleNewTask}
      />

      <div className="flex max-w-7xl mx-auto">
        <Sidebar
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onExportICS={handleExportICS}
          onExportCSV={handleExportCSV}
          taskCounts={taskCounts}
        />

        <CalendarGrid
          currentDate={currentDate}
          tasks={tasks}
          selectedCategories={selectedCategories}
          onTimeSlotClick={handleTimeSlotClick}
          onTaskClick={handleTaskClick}
        />
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
      />
    </div>
  );
}
