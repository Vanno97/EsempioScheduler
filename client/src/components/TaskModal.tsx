import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertTaskSchema, updateTaskSchema, categories, type Task, type InsertTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2 } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultDate?: string;
  defaultTime?: string;
}

export function TaskModal({ isOpen, onClose, task, defaultDate, defaultTime }: TaskModalProps) {
  const [conflictError, setConflictError] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTask>({
    resolver: zodResolver(task ? updateTaskSchema.omit({ id: true }) : insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      date: defaultDate || "",
      startTime: defaultTime || "",
      duration: 60,
      category: "work",
      reminder: "none",
      email: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        date: task.date,
        startTime: task.startTime,
        duration: task.duration,
        category: task.category,
        reminder: task.reminder || "none",
        email: task.email || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        date: defaultDate || "",
        startTime: defaultTime || "",
        duration: 60,
        category: "work",
        reminder: "none",
        email: "",
      });
    }
    setConflictError("");
  }, [task, defaultDate, defaultTime, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task creato con successo" });
      onClose();
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorizzato",
          description: "Sei stato disconnesso. Accedi di nuovo...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      if (error.message.includes("409")) {
        setConflictError("Questo task è in conflitto con un task esistente. Scegli un orario diverso.");
      } else {
        toast({ 
          title: "Creazione task fallita", 
          description: error.message,
          variant: "destructive" 
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const response = await apiRequest("PUT", `/api/tasks/${task?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task aggiornato con successo" });
      onClose();
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorizzato",
          description: "Sei stato disconnesso. Accedi di nuovo...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      if (error.message.includes("409")) {
        setConflictError("Questo task è in conflitto con un task esistente. Scegli un orario diverso.");
      } else {
        toast({ 
          title: "Aggiornamento task fallito", 
          description: error.message,
          variant: "destructive" 
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task eliminato con successo" });
      onClose();
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorizzato",
          description: "Sei stato disconnesso. Accedi di nuovo...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Eliminazione task fallita", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: InsertTask) => {
    // Validazione aggiuntiva
    if (!data.title.trim()) {
      form.setError("title", { message: "Il titolo è obbligatorio" });
      return;
    }
    
    if (!data.date) {
      form.setError("date", { message: "La data è obbligatoria" });
      return;
    }
    
    if (!data.startTime) {
      form.setError("startTime", { message: "L'ora di inizio è obbligatoria" });
      return;
    }
    
    if (data.duration < 15) {
      form.setError("duration", { message: "La durata minima è 15 minuti" });
      return;
    }
    
    // Solo se il promemoria è impostato, l'email diventa obbligatoria
    if (data.reminder && data.reminder !== "none" && !data.email?.trim()) {
      form.setError("email", { message: "L'email è obbligatoria per i promemoria" });
      return;
    }

    // Se non c'è promemoria, rimuovi l'email dai dati
    const finalData = { ...data };
    if (!data.reminder || data.reminder === "none") {
      finalData.email = undefined;
      finalData.reminder = null;
    }

    setConflictError("");
    if (task) {
      updateMutation.mutate(finalData);
    } else {
      createMutation.mutate(finalData);
    }
  };

  const handleDelete = () => {
    if (task && window.confirm("Sei sicuro di voler eliminare questo appuntamento?")) {
      deleteMutation.mutate();
    }
  };

  const reminderOptions = [
    { value: "none", label: "Nessun promemoria" },
    { value: "15min", label: "15 minuti prima" },
    { value: "1hour", label: "1 ora prima" },
    { value: "1day", label: "1 giorno prima" },
    { value: "2days", label: "2 giorni prima" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {task ? "Modifica Appuntamento" : "Nuovo Appuntamento"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo*</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci il titolo del task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione (Opzionale)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci la descrizione del task" 
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora di Inizio</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durata (minuti)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="15" 
                        step="15" 
                        placeholder="60"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reminder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promemoria Email</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona orario promemoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reminderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("reminder") && form.watch("reminder") !== "none" && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indirizzo Email*</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Inserisci email per promemoria"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {conflictError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{conflictError}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-4">
              <div>
                {task && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annulla
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {task ? "Aggiorna Appuntamento" : "Salva Appuntamento"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}