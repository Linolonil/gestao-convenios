import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReprovarConvenioDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ReprovarConvenioDialog = ({
    open,
    onClose,
    onConfirm,
}: ReprovarConvenioDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reprovar Contrato</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja reprovar este contrato? Esta ação irá deletar
                        permanentemente o contrato, o parceiro e todos os documentos
                        associados. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Sim, reprovar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
