import { Card, CardContent } from "@/components/ui/card";

interface StatusConfigItem {
    label: string;
    color?: string; 
}

interface ConveniosCardsProps {
    statusConfig: Record<string, StatusConfigItem>;
    convenios: Array<{ status: string }>;
    setSelectedStatus: (status: string) => void;
}

export const ConveniosCards = ({
    statusConfig,
    convenios,
    setSelectedStatus,
}: ConveniosCardsProps) => {
    const getStatusCount = (status: string) =>
        convenios.filter((c) => c.status === status).length;

    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Object.entries(statusConfig).map(([status, config]) => {
                const count = getStatusCount(status);
                return (
                    <Card
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-primary/10 active:scale-95"
                    >
                        <CardContent className="p-6 flex flex-col justify-between">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">{config.label}</p>
                                <p className="text-3xl font-bold text-primary">{count}</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
