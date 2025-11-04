import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BarraLateralApp } from "./components/BarraLateralApp";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Convenios from "./pages/Convenios";
import NovoConvenio from "./pages/NovoConvenio";
import EditarConvenio from "./pages/EditarConvenio";
import DetalhesConvenio from "./pages/DetalhesConvenio";
import Documentos from "./pages/Documentos";
import NotFound from "./pages/NotFound";
import Parceiros from "./pages/Parceiros";
import Usuarios from "./pages/Usuarios";
import { Button } from "./components/ui/button";
import { LogOut, User } from "lucide-react";

const queryClient = new QueryClient();

const AppHeader = () => {
  const { usuario, signOut } = useAuth();
  
  return (
    <header className="h-14 flex items-center border-b border-border px-6 bg-background">
      <SidebarTrigger className="mr-4" />
      <div className="flex-1" />
      {usuario && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">{usuario.nome}</p>
              <p className="text-xs text-muted-foreground">{usuario.perfil}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      )}
    </header>
  );
};

const AppContent = () => {
  const { user, usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
      <div className="flex min-h-screen w-full">
        <BarraLateralApp />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 bg-muted/30">
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
