"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { AtivarConvenioDialog } from "./AtivarConvenioDialog";
import { ConveniosTable } from "./ConveniosTable";
import { ReprovarConvenioDialog } from "./ReprovarConvenioDialog";

interface Convenio {
    id_contrato: number | string;
    numero?: string;
    created_at?: string;
    data_inicio?: string;
    data_fim?: string;
    parceiros?: any;
    parceiro?: any;
    status?: string;
}

interface StatusConfigItem {
    label: string;
}

interface Props {
    statusConfig: Record<string, StatusConfigItem>;
    selectedStatus: string | null;
    setSelectedStatus: (s: string | null) => void;
    filteredConvenios: Convenio[];
    paginatedConvenios: Convenio[];
    conveniosServicos: Record<string, string>;
    conveniosDescontos: Record<string, number>;
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    itemsPerPage: number;
    setItemsPerPage: (n: number) => void;
    navigate: (path: string, options?: any) => void;
    formatDataExpiracao: (d?: string) => { isExpired: boolean; text: string };
    formatDataHora: (d?: string) => string;
    formatDataCadastro: (d?: string) => string;
    totalPages: number;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>
    handleAprovarConvenio: (id: number | string) => void;
    setConvenioToReprove: (c: Convenio | null) => void;
    convenioToReprove: Convenio | null;
    handleReprovarConvenio: () => void;
    convenioToActivate: Convenio | null;
    setConvenioToActivate: (c: Convenio | null) => void;
    setNumeroContrato: (v: string) => void;
    numeroContrato: string;
    handleAtivarConvenio: () => void;
    fetchConvenios: () => Promise<void>;

}

export default function ConveniosPanel({
    statusConfig,
    selectedStatus,
    setSelectedStatus,
    filteredConvenios,
    paginatedConvenios,
    conveniosServicos,
    conveniosDescontos,
    searchTerm,
    setSearchTerm,
    itemsPerPage,
    setItemsPerPage,
    navigate,
    formatDataExpiracao,
    formatDataHora,
    formatDataCadastro,
    totalPages,
    currentPage,
    setCurrentPage,
    handleAprovarConvenio,
    setConvenioToReprove,
    convenioToReprove,
    handleReprovarConvenio,
    convenioToActivate,
    setConvenioToActivate,
    setNumeroContrato,
    numeroContrato,
    handleAtivarConvenio,
}: Props) {

    
    
    return (
        <>
        <div className="p-6 space-y-6 h-full w-full">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedStatus(null)}
                    aria-label="Voltar"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold truncate">
                        Convênios - {statusConfig[selectedStatus ?? ""]?.label}
                    </h1>
                    <p className="text-muted-foreground">
                        {filteredConvenios.length} convênio(s) encontrado(s)
                    </p>
                </div>

                <Button onClick={() => navigate("/convenios/novo")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Convênio
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Buscar por nome, número ou CPF/CNPJ..."
                        value={searchTerm}
                        onChange={(e: any) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                        aria-label="Buscar convênios"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Itens por página:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
                <div className="w-full overflow-x-auto">
                    <ConveniosTable
                        selectedStatus={selectedStatus}
                        paginatedConvenios={paginatedConvenios}
                        searchTerm={searchTerm}
                        conveniosServicos={conveniosServicos}
                        conveniosDescontos={conveniosDescontos}
                        formatDataExpiracao={formatDataExpiracao}
                        formatDataHora={formatDataHora}
                        formatDataCadastro={formatDataCadastro}
                        navigate={navigate}
                        handleAprovarConvenio={handleAprovarConvenio}
                        handleReprovarConvenio={handleReprovarConvenio}
                        handleAtivarConvenio={handleAtivarConvenio}
                        setConvenioToReprove={setConvenioToReprove}
                        setConvenioToActivate={setConvenioToActivate}
                    />
                </div>    

            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                            </PaginationItem>

                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                } else if (page === currentPage - 2 || page === currentPage + 2) {
                                    return (
                                        <span key={page} className="px-2">
                                            ...
                                        </span>
                                    );
                                }
                                return null;
                            })}

                            <PaginationItem>
                                <PaginationNext onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>

            <ReprovarConvenioDialog
                open={!!convenioToReprove}
                onClose={() => setConvenioToReprove(null)}
                onConfirm={handleReprovarConvenio}
            />

            <AtivarConvenioDialog
                open={!!convenioToActivate}
                onClose={() => {
                    setConvenioToActivate(null);
                    setNumeroContrato("");
                }}
                numeroContrato={numeroContrato}
                setNumeroContrato={setNumeroContrato}
                onConfirm={handleAtivarConvenio}
            />
        </>
    );
}
