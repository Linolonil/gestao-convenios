import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const ConveniosHeader = ({ navigate }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold">Contratos</h1>
            <p className="text-muted-foreground">Gerencie seus convênios</p>
        </div>
        <Button onClick={() => navigate('/convenios/novo')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Convênio
        </Button>
    </div>
);
