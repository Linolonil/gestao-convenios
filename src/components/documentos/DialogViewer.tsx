import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileWarning } from "lucide-react";

interface DialogViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nome: string;
    url: string;
    type: "image" | "pdf" | "other";
}

export const DialogViewer = ({ open, onOpenChange, nome, url, type }: DialogViewerProps) => {
    const renderContent = () => {
        switch (type) {
            case "image":
                return (
                    <img
                        src={url}
                        alt={nome}
                        className="w-full h-full object-contain rounded-md"
                        loading="lazy"
                    />
                );

            case "pdf":
                return (
                    <iframe
                        src={url}
                        className="w-full h-full border-0 rounded-md"
                        title={nome}
                    />
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                        <FileWarning className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground max-w-sm">
                            O formato deste arquivo não é suportado para visualização direta.{" "}
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline font-medium"
                            >
                                Abrir em nova aba
                            </a>
                        </p>
                    </div>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col",
                    type === "other" && "items-center justify-center p-6"
                )}
            >
                <DialogHeader className="flex flex-row items-center justify-start gap-5 px-6 py-3 border-b bg-muted/40">
                    <DialogTitle className="text-base font-semibold truncate ">{nome}</DialogTitle>
                </DialogHeader>

                {/* Conteúdo principal */}
                <div className="flex-1 overflow-hidden bg-background">{renderContent()}</div>
            </DialogContent>
        </Dialog>
    );
};
