import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Ban, FileText, MoreHorizontal, Zap } from "lucide-react";

interface ConveniosTableProps {
    selectedStatus: string;
    paginatedConvenios: any[];
    searchTerm: string;
    conveniosServicos: Record<string, string>;
    conveniosDescontos: Record<string, number>;
    formatDataExpiracao: (d: string) => { text: string; isExpired: boolean };
    formatDataHora: (d: string) => string;
    formatDataCadastro: (d: string) => string;
    navigate: (path: string, opts?: any) => void;
    handleAprovarConvenio: (id: string) => void;
    handleReprovarConvenio: () => void;
    handleAtivarConvenio: () => void;
    setConvenioToReprove: (convenio: any) => void;
    setConvenioToActivate: (convenio: any) => void;
}

export const ConveniosTable = ({
    selectedStatus,
    paginatedConvenios,
    searchTerm,
    conveniosServicos,
    conveniosDescontos,
    formatDataExpiracao,
    formatDataHora,
    formatDataCadastro,
    navigate,
    handleAprovarConvenio,
    handleReprovarConvenio,
    handleAtivarConvenio,
    setConvenioToReprove,
    setConvenioToActivate,
}: ConveniosTableProps) => {
    return (
        <Card className="w-full">
            <CardContent className="p-0 w-full">
                <div className="w-full min-w-[800px]">
                    <Table className="w-full border-collapse">
                        <TableHeader>
                            <TableRow>
                                {selectedStatus === "ATIVO" ? (
                                    <>
                                        <TableHead>NÚMERO</TableHead>
                                        <TableHead>PARCEIRO</TableHead>
                                        <TableHead>CPF/CNPJ</TableHead>
                                        <TableHead>SERVIÇO</TableHead>
                                        <TableHead>INÍCIO EM</TableHead>
                                        <TableHead>EXPIRA EM</TableHead>
                                        <TableHead>AÇÕES</TableHead>
                                    </>
                                ) : (
                                    <>
                                        <TableHead>Número do Convênio</TableHead>
                                        <TableHead>Nome do Parceiro</TableHead>
                                        <TableHead>Serviço Oferecido</TableHead>
                                        <TableHead>Desconto</TableHead>
                                        <TableHead>Data de Cadastro</TableHead>
                                        {(selectedStatus === "EM_ANALISE" ||
                                            selectedStatus === "EM_NEGOCIACAO") && (
                                                <TableHead>Ações</TableHead>
                                            )}
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedConvenios.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={
                                            selectedStatus === "ATIVO"
                                                ? 7
                                                : selectedStatus === "EM_ANALISE" ||
                                                    selectedStatus === "EM_NEGOCIACAO"
                                                    ? 6
                                                    : 5
                                        }
                                        className="text-center py-12"
                                    >
                                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {searchTerm
                                                ? "Nenhum convênio encontrado para a busca"
                                                : "Nenhum convênio encontrado"}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedConvenios.map((convenio) => {
                                    if (selectedStatus === "ATIVO") {
                                        const expiracao = formatDataExpiracao(convenio.data_fim);
                                        return (
                                            <TableRow key={convenio.id_contrato}>
                                                <TableCell>
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/convenios/${convenio.id_contrato}`, {
                                                                state: { selectedStatus },
                                                            })
                                                        }
                                                        className="text-primary hover:underline font-medium"
                                                    >
                                                        {convenio.numero || `#${convenio.id_contrato}`}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="truncate max-w-[200px]">
                                                    {convenio.parceiro?.nome || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {convenio.parceiro?.cpf ||
                                                        convenio.parceiro?.cnpj ||
                                                        "-"}
                                                </TableCell>
                                                <TableCell className="truncate max-w-[200px]">
                                                    {conveniosServicos[convenio.id_contrato] ||
                                                        "Nenhum serviço"}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDataHora(convenio.data_inicio)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            expiracao.isExpired ? "destructive" : "secondary"
                                                        }
                                                    >
                                                        {expiracao.text}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Editar"
                                                        >
                                                            <Zap className="w-4 h-4 text-yellow-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Cancelar"
                                                        >
                                                            <Ban className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    return (
                                        <TableRow key={convenio.id_contrato}>
                                            <TableCell>
                                                <button
                                                    onClick={() =>
                                                        navigate(`/convenios/${convenio.id_contrato}`, {
                                                            state: { selectedStatus },
                                                        })
                                                    }
                                                    className="text-primary hover:underline font-medium"
                                                >
                                                    {convenio.numero || `#${convenio.id_contrato}`}
                                                </button>
                                            </TableCell>
                                            <TableCell>{convenio.parceiro?.nome || "-"}</TableCell>
                                            <TableCell>
                                                {conveniosServicos[convenio.id_contrato] || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {conveniosDescontos[convenio.id_contrato]
                                                    ? `${conveniosDescontos[convenio.id_contrato]}%`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {formatDataCadastro(convenio.created_at)}
                                            </TableCell>

                                            {selectedStatus === "EM_ANALISE" && (
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleAprovarConvenio(convenio.id_contrato)
                                                                }
                                                            >
                                                                Aprovar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setConvenioToReprove(convenio)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                Reprovar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            )}

                                            {selectedStatus === "EM_NEGOCIACAO" && (
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setConvenioToActivate(convenio)
                                                                }
                                                            >
                                                                Ativar Convênio
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
