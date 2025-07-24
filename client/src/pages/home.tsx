import { useState } from "react";
import { CalendarGrid } from "@/components/CalendarGrid";
import { Sidebar } from "@/components/Sidebar";
import { TaskModal } from "@/components/TaskModal";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryClient } from "@/lib/queryClient";

export default function Home() {
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [defaultDate, setDefaultDate] = useState("");
  const [defaultTime, setDefaultTime] = useState("");

  const handleCreateTask = (date?: string, time?: string) => {
    setSelectedTask(null);
    setDefaultDate(date || "");
    setDefaultTime(time || "");
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: any) => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agenda Settimanale
            </h1>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    @{user?.username}
                  </p>
                </div>
                <DropdownMenuItem onClick={() => {
                  fetch('/api/logout', { method: 'POST' })
                    .then(() => {
                      queryClient.setQueryData(["/api/user"], null);
                      window.location.reload();
                    });
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnetti</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <Sidebar onCreateTask={handleCreateTask} />
          <div className="flex-1">
            <CalendarGrid 
              onCreateTask={handleCreateTask}
              onEditTask={handleEditTask}
            />
          </div>
        </div>
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