import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SecaoComentarios from "./SecaoComentarios";

interface DialogComentariosProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentoId: number;
    usuarioId: number;
    nomeDocumento: string;
}

export const DialogComentarios = ({
    open,
    onOpenChange,
    documentoId,
    usuarioId,
    nomeDocumento,
}: DialogComentariosProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Comentários - {nomeDocumento}</DialogTitle>
                </DialogHeader>
                <SecaoComentarios documentoId={documentoId} usuarioId={usuarioId} />
            </DialogContent>
        </Dialog>
    );
};
