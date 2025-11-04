import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DialogoRejeitarConvenioProps {
  convenioId: number;
  onReject: () => void;
}

const DialogoRejeitarConvenio = ({ convenioId, onReject }: DialogoRejeitarConvenioProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [notificarEmail, setNotificarEmail] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReject = async () => {
    if (!motivo.trim()) {
      toast({
        title: "Erro",
        description: "Informe o motivo da rejeição do convênio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('contratos')
        .update({ 
          status: 'ENCERRADO'
        })
        .eq('id_contrato', convenioId);

      if (error) throw error;

      // TODO: Se notificarEmail === true, chamar edge function para enviar email
      // Implementar na Fase 6

      toast({
        title: "Convênio rejeitado",
        description: "Convênio rejeitado com sucesso",
        variant: "destructive",
      });

      setIsOpen(false);
      setMotivo("");
      setNotificarEmail(true);
      onReject();
    } catch (error) {
      console.error('Error rejecting convenio:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar convênio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0 border-red-300 text-red-700 hover:bg-red-50">
          <X className="h-4 w-4 mr-2" />
          Rejeitar Convênio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rejeitar Convênio Completo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              ⚠️ Você está prestes a rejeitar este convênio completamente. 
              Para rejeitar apenas documentos individuais, use o botão "Rejeitar" de cada documento.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo geral da rejeição do convênio *</Label>
            <Textarea
              id="motivo"
              placeholder="Descreva o motivo pelo qual este convênio está sendo rejeitado..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="notificar-email"
              checked={notificarEmail}
              onCheckedChange={(checked) => setNotificarEmail(checked === true)}
            />
            <label
              htmlFor="notificar-email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Notificar parte conveniada por email
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
              onClick={handleReject}
              disabled={isLoading}
            >
              {isLoading ? "Rejeitando..." : "Rejeitar Convênio"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogoRejeitarConvenio;
