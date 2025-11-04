import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DialogoSolicitarCorrecaoProps {
  documento: {
    id_documento: number;
    nome: string;
  };
  usuarioId: number;
  onSolicitar: () => void;
}

const DialogoSolicitarCorrecao = ({ documento, usuarioId, onSolicitar }: DialogoSolicitarCorrecaoProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [solicitacao, setSolicitacao] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSolicitar = async () => {
    if (!solicitacao.trim()) {
      toast({
        title: "Erro",
        description: "Descreva o que precisa ser corrigido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('documentos')
        .update({
          status: 'pendente',
          motivo_rejeicao: `Correção solicitada: ${solicitacao}`
        })
        .eq('id_documento', documento.id_documento);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Correção solicitada com sucesso",
      });

      setIsOpen(false);
      setSolicitacao("");
      onSolicitar();
    } catch (error) {
      console.error('Error requesting correction:', error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar correção",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Solicitar Correção
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Correção de Documento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Documento:</p>
            <p className="text-sm text-muted-foreground">{documento.nome}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="solicitacao">O que precisa ser corrigido?</Label>
            <Textarea
              id="solicitacao"
              placeholder="Descreva detalhadamente o que precisa ser corrigido neste documento..."
              value={solicitacao}
              onChange={(e) => setSolicitacao(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Esta solicitação será enviada para a parte conveniada e o documento será marcado como "Requer Correção".
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSolicitar}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isLoading ? "Enviando..." : "Solicitar Correção"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogoSolicitarCorrecao;
