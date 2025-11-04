import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, User, Shield, GraduationCap } from 'lucide-react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  ativo: boolean;
  perfil: 'ADMIN' | 'ANALISTA' | 'ESTAGIARIO';
  created_at: string;
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    senha: '',
    perfil: 'ESTAGIARIO' as 'ADMIN' | 'ANALISTA' | 'ESTAGIARIO',
    ativo: true,
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map(u => ({
        id: u.id_usuario,
        nome: u.nome,
        email: u.email,
        cpf: '', // CPF não existe na tabela
        senha: u.senha,
        ativo: u.ativo,
        perfil: u.perfil,
        created_at: u.created_at
      }));
      setUsuarios(mapped);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingUsuario(null);
    setFormData({
      nome: '',
      email: '',
      cpf: '',
      senha: '',
      perfil: 'ESTAGIARIO',
      ativo: true,
    });
    setShowDialog(true);
  };

  const openEditDialog = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf,
      senha: usuario.senha,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.cpf || !formData.senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingUsuario) {
        const { error } = await supabase
          .from('usuarios')
          .update({
            nome: formData.nome,
            email: formData.email,
            senha: formData.senha,
            perfil: formData.perfil,
            ativo: formData.ativo
          })
          .eq('id_usuario', editingUsuario.id);

        if (error) throw error;

        toast({
          title: "Usuário atualizado",
          description: "Usuário atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('usuarios')
          .insert({
            nome: formData.nome,
            email: formData.email,
            senha: formData.senha,
            perfil: formData.perfil,
            ativo: formData.ativo
          });

        if (error) throw error;

        toast({
          title: "Usuário criado",
          description: "Novo usuário criado com sucesso",
        });
      }

      setShowDialog(false);
      fetchUsuarios();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar usuário",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!usuarioToDelete) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id_usuario', usuarioToDelete.id);

      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: "Usuário excluído com sucesso",
      });

      fetchUsuarios();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário",
        variant: "destructive",
      });
    }

    setShowDeleteDialog(false);
    setUsuarioToDelete(null);
  };

  const getPerfilIcon = (perfil: string) => {
    switch (perfil) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      case 'ANALISTA':
        return <User className="w-4 h-4" />;
      case 'ESTAGIARIO':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getPerfilVariant = (perfil: string) => {
    switch (perfil) {
      case 'ADMIN':
        return 'destructive';
      case 'ANALISTA':
        return 'default';
      case 'ESTAGIARIO':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Adicione, edite ou remova usuários do sistema</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {usuarios.map((usuario) => (
          <Card key={usuario.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  {getPerfilIcon(usuario.perfil)}
                  {usuario.nome}
                </div>
              </CardTitle>
              <Badge variant={getPerfilVariant(usuario.perfil)}>
                {usuario.perfil}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1 mb-4">
                <p className="text-muted-foreground">{usuario.email}</p>
                <p className="text-muted-foreground">{usuario.cpf}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={usuario.ativo ? 'default' : 'secondary'}>
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(usuario)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => openDeleteDialog(usuario)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil</Label>
              <Select value={formData.perfil} onValueChange={(value: any) => setFormData({ ...formData, perfil: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="ANALISTA">Analista</SelectItem>
                  <SelectItem value="ESTAGIARIO">Estagiário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ativo">Usuário Ativo</Label>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{usuarioToDelete?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Usuarios;