import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface DialogReenvioProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentoNome: string;
    motivoRejeicao?: string;
    novoArquivo: File | null;
    setNovoArquivo: (file: File | null) => void;
    isLoading: boolean;
    onEnviar: () => void;
}

export const DialogReenvio = ({
    open,
    onOpenChange,
    documentoNome,
    motivoRejeicao,
    novoArquivo,
    setNovoArquivo,
    isLoading,
    onEnviar,
}: DialogReenvioProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reenviar Documento</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Documento atual:</p>
                        <p className="text-sm text-muted-foreground">{documentoNome}</p>
                        {motivoRejeicao && (
                            <div className="mt-2">
                                <p className="text-sm font-medium text-destructive">Motivo:</p>
                                <p className="text-sm text-muted-foreground">{motivoRejeicao}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="novo-arquivo" className="text-sm font-medium">
                            Selecionar novo arquivo
                        </label>
                        <Input
                            id="novo-arquivo"
                            type="file"
                            onChange={(e) => setNovoArquivo(e.target.files?.[0] || null)}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                        {novoArquivo && (
                            <p className="text-xs text-muted-foreground">
                                Arquivo selecionado: {novoArquivo.name}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                setNovoArquivo(null);
                            }}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>

                        <Button onClick={onEnviar} disabled={isLoading || !novoArquivo}>
                            <Upload className="h-4 w-4 mr-2" />
                            {isLoading ? "Enviando..." : "Enviar"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
