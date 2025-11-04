import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Eye, MoreVertical, Search, XCircle } from "lucide-react";

export function ParceirosTable({ parceiros, selectedIds, setSelectedIds, onView, onEdit, onInativar }) {
    const toggleSelectAll = () => {
        if (selectedIds.length === parceiros.length) setSelectedIds([]);
        else setSelectedIds(parceiros.map((p) => p.id));
    };

    const toggleSelectId = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12">
                            <Checkbox
                                checked={selectedIds.length === parceiros.length && parceiros.length > 0}
                                onCheckedChange={toggleSelectAll}
                            />
                        </TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>NOME</TableHead>
                        <TableHead>CPF/CNPJ</TableHead>
                        <TableHead>EMAIL</TableHead>
                        <TableHead>TELEFONE</TableHead>
                        <TableHead>SEGMENTO</TableHead>
                        <TableHead className="text-right">AÇÕES</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parceiros.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-12">
                                <div className="flex flex-col items-center gap-2">
                                    <Search className="w-12 h-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">Nenhum parceiro encontrado</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        parceiros.map((p) => (
                            <TableRow key={p.id} className="hover:bg-muted/50">
                                <TableCell>
                                    <Checkbox checked={selectedIds.includes(p.id)} onCheckedChange={() => toggleSelectId(p.id)} />
                                </TableCell>
                                <TableCell>
                                    {p.ativo ? <Badge>ATIVO</Badge> : <Badge variant="destructive">INATIVO</Badge>}
                                </TableCell>
                                <TableCell className="font-medium">{p.nome}</TableCell>
                                <TableCell className="text-muted-foreground">{p.cpf_cnpj}</TableCell>
                                <TableCell className="text-muted-foreground">{p.email || "-"}</TableCell>
                                <TableCell className="text-muted-foreground">{p.telefone || "-"}</TableCell>
                                <TableCell>
                                    {p.categorias?.length ? (
                                        <div className="flex flex-wrap gap-1">
                                            {p.categorias.map((cat, i) => (
                                                <Badge key={i} variant="outline">
                                                    {cat}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onView(p)}>
                                                <Eye className="h-4 w-4 mr-2" /> Visualizar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(p)}>
                                                <Edit className="h-4 w-4 mr-2" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onInativar(p)}
                                                disabled={!p.ativo}
                                                className="text-destructive"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" /> Inativar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
