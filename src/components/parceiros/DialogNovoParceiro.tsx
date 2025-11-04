import { FormularioParceiro } from "@/components/parceiros/FormularioParceiro";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function DialogNovoParceiro({ open, onOpenChange, onCreate, loading }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo Parceiro</DialogTitle>
                </DialogHeader>
                <FormularioParceiro submitLabel="Cadastrar" onSubmit={onCreate} loading={loading} />
            </DialogContent>
        </Dialog>
    );
}
