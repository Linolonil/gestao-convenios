import logoOabCaaam from '@/assets/logo-oab-caaam.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: ''
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    const { error } = await signIn(data.email, data.senha);

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao sistema!",
      });
      // navigate('/dashboard');
    }
  };

  return (
    // 1. Container principal que ocupa a tela inteira e centraliza o conteúdo
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative">

      {/* 2. Imagem de fundo e overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg-login.png" // Certifique-se que a imagem está na pasta `public`
          alt="Fundo do sistema de convênios"
          className="h-full w-full object-cover filter grayscale"
        />
        {/* Overlay escuro para garantir contraste */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* 3. Card de Login, que fica na camada superior (z-10) */}
      <Card className="w-full max-w-md z-10 bg-white/90 dark:bg-black/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <img
            src={logoOabCaaam}
            alt="Logo OAB Amazonas CAAAM"
            className="h-20 w-auto object-contain mx-auto mb-4"
          />
          <CardTitle className="text-2xl">Sistema de Convênios</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  disabled={isSubmitting}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha">Senha</Label>
                <Link
                  to="/esqueci-minha-senha"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  disabled={isSubmitting}
                  {...register('senha')}
                />
              </div>
              {errors.senha && (
                <p className="text-sm text-destructive">{errors.senha.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
