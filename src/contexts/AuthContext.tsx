import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Perfil = 'ADMIN' | 'ANALISTA' | 'ESTAGIARIO';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  ativo: boolean;
  perfil: Perfil;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  usuario: Usuario | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, senha: string, nome: string, cpf: string, perfil: Perfil) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasPermission: (requiredPerfil: Perfil | Perfil[]) => boolean;
  isAdmin: () => boolean;
  isAnalista: () => boolean;
  isEstagiario: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setLoading(true);
          setTimeout(() => {
            fetchUsuario(session.user.email!);
          }, 0);
        } else {
          setUsuario(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUsuario(session.user.email!);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUsuario = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setUsuario({
          id: data.id_usuario,
          nome: data.nome,
          email: data.email,
          cpf: '', // CPF não existe na tabela usuarios
          ativo: data.ativo,
          perfil: data.perfil
        });
      } else {
        toast({
          title: "Usuário não encontrado",
          description: "Este usuário não está cadastrado no sistema.",
          variant: "destructive",
        });
        await signOut();
      }
    } catch (error) {
      console.error('Error fetching usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, senha: string) => {
    try {
      // Primeiro, tentar sincronizar o usuário com o Supabase Auth
      const { error: syncError } = await supabase.functions.invoke('sync-auth-user', {
        body: { email, password: senha },
      });

      if (syncError) {
        console.error('Sync error:', syncError);
      }

      // Tentar fazer login no Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        // Se falhar, pode ser que o usuário não exista na tabela usuarios
        return { error: new Error('Email ou senha incorretos') };
      }

      // Após autenticação bem-sucedida, verificar se usuário existe e está ativo
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (usuarioError) throw usuarioError;

      if (!usuarioData) {
        await supabase.auth.signOut();
        return { error: new Error('Usuário não encontrado no sistema') };
      }

      if (!usuarioData.ativo) {
        await supabase.auth.signOut();
        return { error: new Error('Usuário inativo') };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, senha: string, nome: string, cpf: string, perfil: Perfil) => {
    try {
      // Criar usuário na tabela usuarios
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          nome,
          email,
          cpf,
          senha,
          perfil,
          ativo: true,
        });

      if (insertError) throw insertError;

      // Criar no Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (authError) throw authError;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUsuario(null);
  };

  const hasPermission = (requiredPerfil: Perfil | Perfil[]): boolean => {
    if (!usuario) return false;
    
    const perfis = Array.isArray(requiredPerfil) ? requiredPerfil : [requiredPerfil];
    return perfis.includes(usuario.perfil);
  };

  const isAdmin = () => usuario?.perfil === 'ADMIN';
  const isAnalista = () => usuario?.perfil === 'ANALISTA';
  const isEstagiario = () => usuario?.perfil === 'ESTAGIARIO';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        usuario,
        loading,
        signIn,
        signUp,
        signOut,
        hasPermission,
        isAdmin,
        isAnalista,
        isEstagiario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};