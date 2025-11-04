import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DetalhesConvenio from "./components/convenio/DetalhesConvenio";
import EditarConvenio from "./components/convenio/EditarConvenio";
import NovoConvenio from "./components/convenio/NovoConvenio";
import { BarraLateralApp } from "./components/layout/BarraLateralApp";
import NotFound from "./components/layout/NotFound.tsx";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { Button } from "./components/ui/button";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Convenios from "./pages/Convenios";
import Dashboard from "./pages/Dashboard";
import Documentos from "./pages/Documentos";
import Login from "./pages/Login";
import Parceiros from "./pages/Parceiros";
import Usuarios from "./pages/Usuarios";

const queryClient = new QueryClient();

const AppHeader = () => {
  const { usuario, signOut } = useAuth();
  
  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPerfil = (perfil: string) => {
    const perfis: Record<string, string> = {
      'ADMIN': 'Administrador',
      'ANALISTA': 'Analista',
      'ESTAGIARIO': 'Estagiário',
      'CONSULTOR': 'Consultor'
    };
    return perfis[perfil] || perfil;
  };

  return (
    <header className="h-16 flex items-center justify-between border-b border-border px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground transition-colors" />
        <div className="hidden md:block">
          <h2 className="text-sm font-semibold text-foreground">
            Sistema de Gestão de Convênios
          </h2>
       
        </div>
      </div>

      {usuario && (
        <div className="flex items-center gap-3">
     
          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-accent"
              >
                <Avatar className="w-9 h-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {getInitials(usuario.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <p className="text-sm font-medium leading-none">
                    {usuario.nome}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getPerfil(usuario.perfil)}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{usuario.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {usuario.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
};

const AppContent = () => {
  const { user, usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !usuario) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <BarraLateralApp />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 bg-muted/30 overflow-auto">
            <Routes>
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/convenios"
                element={
                  <ProtectedRoute>
                    <Convenios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/convenios/novo"
                element={
                  <ProtectedRoute requiredPerfil={['ADMIN', 'ANALISTA', 'ESTAGIARIO']}>
                    <NovoConvenio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/convenios/editar/:id"
                element={
                  <ProtectedRoute requiredPerfil={['ADMIN', 'ANALISTA']}>
                    <EditarConvenio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/convenios/:id"
                element={
                  <ProtectedRoute>
                    <DetalhesConvenio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documentos"
                element={
                  <ProtectedRoute>
                    <Documentos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parceiros"
                element={
                  <ProtectedRoute>
                    <Parceiros />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute requiredPerfil="ADMIN">
                    <Usuarios />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;