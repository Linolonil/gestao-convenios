import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DialogoRejeitarDocumentoProps {
  documento: {
    id_documento: number;
    nome: string;
  };
  usuarioId: number;
  onRejeitar: () => void;
}

const DialogoRejeitarDocumento = ({ documento, usuarioId, onRejeitar }: DialogoRejeitarDocumentoProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [permitirReenvio, setPermitirReenvio] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRejeitar = async () => {
    if (!motivo.trim()) {
      toast({
        title: "Erro",
        description: "Informe o motivo da rejeição",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('documentos')
        .update({
          status: 'rejeitado',
          motivo_rejeicao: motivo
        })
        .eq('id_documento', documento.id_documento);

      if (error) throw error;

      toast({
        title: "Documento rejeitado",
        description: "Documento rejeitado com sucesso",
        variant: "destructive",
      });

      setIsOpen(false);
      setMotivo("");
      setPermitirReenvio(true);
      onRejeitar();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar documento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
          <X className="h-4 w-4 mr-1" />
          Rejeitar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rejeitar Documento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Documento:</p>
            <p className="text-sm text-muted-foreground">{documento.nome}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da rejeição *</Label>
            <Textarea
              id="motivo"
              placeholder="Descreva o motivo da rejeição..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="permitir-reenvio"
              checked={permitirReenvio}
              onCheckedChange={(checked) => setPermitirReenvio(checked === true)}
            />
            <label
              htmlFor="permitir-reenvio"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Permitir reenvio do documento
            </label>
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
              variant="destructive"
              onClick={handleRejeitar}
              disabled={isLoading}
            >
              {isLoading ? "Rejeitando..." : "Rejeitar Documento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogoRejeitarDocumento;
