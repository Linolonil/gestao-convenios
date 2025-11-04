import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ParceirosHeader({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold">Parceiros</h1>
                <p className="text-muted-foreground">Gerencie parceiros e fornecedores</p>
            </div>
            <Button onClick={onAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Parceiro
            </Button>
        </div>
    );
}
