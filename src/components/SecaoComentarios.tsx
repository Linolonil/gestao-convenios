import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, AlertTriangle, CornerDownRight, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Comentario {
  id: number;
  comentario: string;
  tipo: string;
  created_at: string;
  usuarios: {
    nome: string;
    perfil: string;
  };
}

interface SecaoComentariosProps {
  documentoId: number;
  usuarioId: number;
}

const SecaoComentarios = ({ documentoId, usuarioId }: SecaoComentariosProps) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Tabela comentarios_documento não existe ainda
    setComentarios([]);
  }, [documentoId]);

  const fetchComentarios = async () => {
    // Desabilitado até criar a tabela
    setComentarios([]);
  };

  const handleAddComentario = async () => {
    if (!novoComentario.trim()) {
      toast({
        title: "Erro",
        description: "Digite um comentário",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Informação",
      description: "Recurso de comentários será implementado em breve",
    });
  };

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'solicitacao_correcao':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'resposta':
        return <CornerDownRight className="h-4 w-4 text-blue-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBadgeForType = (tipo: string) => {
    switch (tipo) {
      case 'solicitacao_correcao':
        return <Badge className="bg-yellow-100 text-yellow-800">Solicitação</Badge>;
      case 'resposta':
        return <Badge className="bg-blue-100 text-blue-800">Resposta</Badge>;
      default:
        return <Badge variant="secondary">Observação</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comentarios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum comentário ainda</p>
          </div>
        ) : (
          comentarios.map((comentario) => (
            <div
              key={comentario.id}
              className={`p-4 rounded-lg border ${
                comentario.tipo === 'solicitacao_correcao'
                  ? 'bg-yellow-50 border-yellow-200'
                  : comentario.tipo === 'resposta'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-muted/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getIconForType(comentario.tipo)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comentario.usuarios?.nome || 'Usuário'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {comentario.usuarios?.perfil || 'Usuário'}
                      </Badge>
                      {getBadgeForType(comentario.tipo)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comentario.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm">{comentario.comentario}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2 pt-4 border-t">
        <Textarea
          placeholder="Adicionar um comentário..."
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleAddComentario}
            disabled={isLoading || !novoComentario.trim()}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? "Enviando..." : "Adicionar Comentário"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecaoComentarios;
