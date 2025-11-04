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
import { Input } from "@/components/ui/input";

interface AtivarConvenioDialogProps {
    open: boolean;
    onClose: () => void;
    numeroContrato: string;
    setNumeroContrato: (v: string) => void;
    onConfirm: () => void;
}

export const AtivarConvenioDialog = ({
    open,
    onClose,
    numeroContrato,
    setNumeroContrato,
    onConfirm,
}: AtivarConvenioDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Ativar Convênio</AlertDialogTitle>
                    <AlertDialogDescription>
                        Insira o número do contrato para ativar este convênio.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <Input
                        placeholder="Número do contrato"
                        value={numeroContrato}
                        onChange={(e) => setNumeroContrato(e.target.value)}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Ativar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
