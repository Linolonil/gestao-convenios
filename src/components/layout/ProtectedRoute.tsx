import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type Perfil = 'ADMIN' | 'ANALISTA' | 'ESTAGIARIO';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPerfil?: Perfil | Perfil[];
}

const ProtectedRoute = ({ children, requiredPerfil }: ProtectedRouteProps) => {
  const { user, usuario, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPerfil && !hasPermission(requiredPerfil)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;