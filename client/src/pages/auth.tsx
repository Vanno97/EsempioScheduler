import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, registerSchema, type LoginData, type RegisterData } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Calendar, Clock, Mail, Shield } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  if (!isLoading && user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({ title: "Accesso effettuato con successo" });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Accesso fallito",
        description: error.message || "Username o password non corretti",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const { confirmPassword, ...data } = credentials;
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({ title: "Registrazione completata con successo" });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registrazione fallita",
        description: error.message || "Errore durante la registrazione",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Hero Section */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Agenda Settimanale
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Organizza la tua settimana con facilità. Gestisci appuntamenti, imposta promemoria e mantieni tutto sotto controllo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold">Vista Settimanale</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Griglia settimanale chiara
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-semibold">Gestione Orari</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rilevamento conflitti
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <h3 className="font-semibold">Promemoria Email</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notifiche automatiche
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <h3 className="font-semibold">Dati Sicuri</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Privacy garantita
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          <div className="max-w-md mx-auto lg:mx-0">
            <Card>
              <CardHeader>
                <CardTitle>Benvenuto</CardTitle>
                <CardDescription>
                  Accedi al tuo account o creane uno nuovo per iniziare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Accedi</TabsTrigger>
                    <TabsTrigger value="register">Registrati</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          type="text"
                          {...loginForm.register("username")}
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          {...loginForm.register("password")}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Accesso..." : "Accedi"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-username">Username</Label>
                        <Input
                          id="register-username"
                          type="text"
                          {...registerForm.register("username")}
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          {...registerForm.register("email")}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="register-firstName">Nome</Label>
                          <Input
                            id="register-firstName"
                            type="text"
                            {...registerForm.register("firstName")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-lastName">Cognome</Label>
                          <Input
                            id="register-lastName"
                            type="text"
                            {...registerForm.register("lastName")}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          {...registerForm.register("password")}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirmPassword">Conferma Password</Label>
                        <Input
                          id="register-confirmPassword"
                          type="password"
                          {...registerForm.register("confirmPassword")}
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Registrazione..." : "Registrati"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}