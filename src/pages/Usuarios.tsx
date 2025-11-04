"use client";

import { Button } from "@/components/ui/button";
import { UsuarioCard } from "@/components/usuarios/UsuarioCard";
import { UsuarioDeleteDialog } from "@/components/usuarios/UsuarioDeleteDialog";
import { UsuarioFormDialog } from "@/components/usuarios/UsuarioFormDialog";
import { toast } from "@/hooks/use-toast";
import { useUsuarios, Usuario } from "@/hooks/useUsuarios";
import { supabase } from "@/integrations/supabase/client";
import { UsuarioFormData } from "@/types/usuarios";
import { Plus } from "lucide-react";
import { useState } from "react";

const UsuariosPage = () => {
  const { usuarios, loading, fetchUsuarios } = useUsuarios();

  const [formData, setFormData] = useState<UsuarioFormData>({
    nome: "",
    email: "",
    senha: "",
    perfil: "ESTAGIARIO",
    ativo: true,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (selectedUsuario) {
        const { error } = await supabase
          .from("usuarios")
          .update({
            nome: formData.nome,
            email: formData.email,
            senha: formData.senha,
            perfil: formData.perfil,
            ativo: formData.ativo,
          })
          .eq("id_usuario", selectedUsuario.id);

        if (error) throw error;

        toast({
          title: "Usuário atualizado",
          description: `O usuário ${formData.nome} foi atualizado com sucesso.`,
        });
      } else {
        const { error } = await supabase.from("usuarios").insert({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          perfil: formData.perfil,
          ativo: formData.ativo,
        });

        if (error) throw error;

        toast({
          title: "Usuário criado",
          description: `O usuário ${formData.nome} foi criado com sucesso.`,
        });
      }

      // Atualiza lista e fecha modal
      await fetchUsuarios();
      setIsFormOpen(false);
      setSelectedUsuario(null);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
    }
  };

  // --- EXCLUIR usuário
  const handleDelete = async () => {
    if (!selectedUsuario) return;

    try {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id_usuario", selectedUsuario.id);

      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: `O usuário ${selectedUsuario.nome} foi removido.`,
      });

      await fetchUsuarios();
      setIsDeleteOpen(false);
      setSelectedUsuario(null);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Adicione, edite ou remova usuários
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedUsuario(null);
            setFormData({
              nome: "",
              email: "",
              senha: "",
              perfil: "ESTAGIARIO",
              ativo: true,
            });
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      {/* Lista */}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {usuarios.map((u) => (
            <UsuarioCard
              key={u.id}
              usuario={u}
              onEdit={(usr) => {
                setSelectedUsuario(usr);
                setFormData({
                  nome: usr.nome,
                  email: usr.email,
                  senha: usr.senha,
                  perfil: usr.perfil,
                  ativo: usr.ativo,
                });
                setIsFormOpen(true);
              }}
              onDelete={(usr) => {
                setSelectedUsuario(usr);
                setIsDeleteOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Diálogo de Formulário */}
      <UsuarioFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        isEditing={!!selectedUsuario}
      />

      {/* Diálogo de Exclusão */}
      <UsuarioDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        usuarioNome={selectedUsuario?.nome}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UsuariosPage;
