import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface HeaderProps {
  currentWeekLabel: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onNewTask: () => void;
}

export function Header({
  currentWeekLabel,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onNewTask
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Weekly Agenda</h1>
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <Button size="sm" className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md">
              Week
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-white rounded-md"
            >
              Month
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreviousWeek}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-900 min-w-32 text-center">
              {currentWeekLabel}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNextWeek}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Today
          </Button>
          <Button
            onClick={onNewTask}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
    </header>
  );
}
