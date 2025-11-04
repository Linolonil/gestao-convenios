import { useEffect, useState } from "react";
import { useParceiros } from "@/hooks/useParceiros";
import { FormularioParceiro } from "@/components/parceiros/FormularioParceiro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Eye, Edit, XCircle, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ParceirosPage = () => {
  const { listQuery, createMutation, updateMutation, inativarMutation } = useParceiros();
  const { toast } = useToast();
  const [openNew, setOpenNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedParceiro, setSelectedParceiro] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showInativarDialog, setShowInativarDialog] = useState(false);
  const [parceiroToInativar, setParceiroToInativar] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    document.title = "Parceiros | Gestão de Parceiros";
  }, []);

  const onCreate = async (values) => {
    try {
      await createMutation.mutateAsync(values);
      toast({ title: "Parceiro criado com sucesso" });
      setOpenNew(false);
    } catch (error) {
      toast({ title: "Erro", description: error?.message, variant: "destructive" });
    }
  };

  const onUpdate = async (id, values) => {
    try {
      await updateMutation.mutateAsync({ id, input: values });
      toast({ title: "Parceiro atualizado com sucesso" });
      setShowEditDialog(false);
    } catch (error) {
      toast({ title: "Erro", description: error?.message, variant: "destructive" });
    }
  };

  const handleViewParceiro = (parceiro) => {
    setSelectedParceiro(parceiro);
    setShowViewDialog(true);
  };

  const handleEditParceiro = (parceiro) => {
    setSelectedParceiro(parceiro);
    setShowEditDialog(true);
  };

  const handleInativarParceiro = (parceiro) => {
    setParceiroToInativar(parceiro);
    setShowInativarDialog(true);
  };

  const confirmInativar = async () => {
    if (!parceiroToInativar) return;
    try {
      await inativarMutation.mutateAsync(parceiroToInativar.id);
      toast({ title: "Parceiro inativado com sucesso" });
    } catch (error) {
      toast({ title: "Erro ao inativar parceiro", variant: "destructive" });
    }
    setShowInativarDialog(false);
    setParceiroToInativar(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredParceiros.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredParceiros.map(p => p.id));
    }
  };

  const toggleSelectId = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredParceiros = listQuery.data?.filter(parceiro => {
    const matchesSearch = 
      parceiro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parceiro.cpf_cnpj.includes(searchTerm) ||
      parceiro.categorias?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "ativo" && parceiro.ativo === true) ||
      (statusFilter === "inativo" && parceiro.ativo === false);

    return matchesSearch && matchesStatus;
  }) || [];

  if (listQuery.isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Parceiros</h1>
          <p className="text-muted-foreground">Gerencie parceiros e fornecedores</p>
        </div>
        <Button onClick={() => setOpenNew(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Parceiro
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar parceiro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === filteredParceiros.length && filteredParceiros.length > 0}
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
            {filteredParceiros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-12 h-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum parceiro encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredParceiros.map((parceiro) => (
                <TableRow key={parceiro.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(parceiro.id)}
                      onCheckedChange={() => toggleSelectId(parceiro.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {parceiro.ativo === true ? (
                      <Badge>ATIVO</Badge>
                    ) : (
                      <Badge variant="destructive">INATIVO</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{parceiro.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{parceiro.cpf_cnpj}</TableCell>
                  <TableCell className="text-muted-foreground">{parceiro.email || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{parceiro.telefone || '-'}</TableCell>
                  <TableCell>
                    {parceiro.categorias && parceiro.categorias.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {parceiro.categorias.map((categoria, idx) => (
                          <Badge key={idx} variant="outline">{categoria}</Badge>
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
                        <DropdownMenuItem onClick={() => handleViewParceiro(parceiro)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditParceiro(parceiro)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleInativarParceiro(parceiro)}
                          disabled={parceiro.ativo !== true}
                          className="text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Inativar
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

      {/* Dialog Novo Parceiro */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Parceiro</DialogTitle>
          </DialogHeader>
          <FormularioParceiro submitLabel="Cadastrar" onSubmit={onCreate} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizar */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Parceiro</DialogTitle>
          </DialogHeader>
          {selectedParceiro && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedParceiro.nome}</h3>
                  {selectedParceiro.categorias && selectedParceiro.categorias.length > 0 && (
                    <p className="text-muted-foreground">Segmento: {selectedParceiro.categorias.join(', ')}</p>
                  )}
                </div>
                {selectedParceiro.ativo === true ? (
                  <Badge>ATIVO</Badge>
                ) : (
                  <Badge variant="destructive">INATIVO</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CPF/CNPJ</label>
                  <p className="text-sm">{selectedParceiro.cpf_cnpj}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p className="text-sm">{selectedParceiro.tipo_pessoa === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
                </div>
                {selectedParceiro.tipo_pessoa === 'juridica' && selectedParceiro.responsavel && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Responsável</label>
                    <p className="text-sm">{selectedParceiro.responsavel}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{selectedParceiro.email || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-sm">{selectedParceiro.telefone || 'Não informado'}</p>
                </div>
                {selectedParceiro.endereco_completo && (
                  <>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                      <p className="text-sm">
                        {selectedParceiro.endereco_completo.logradouro}
                        {selectedParceiro.endereco_completo.numero && `, ${selectedParceiro.endereco_completo.numero}`}
                        {selectedParceiro.endereco_completo.complemento && ` - ${selectedParceiro.endereco_completo.complemento}`}
                      </p>
                    </div>
                    {selectedParceiro.endereco_completo.bairro && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                        <p className="text-sm">{selectedParceiro.endereco_completo.bairro}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {selectedParceiro.observacoes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Observações</label>
                  <p className="text-sm mt-1">{selectedParceiro.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Parceiro</DialogTitle>
          </DialogHeader>
          {selectedParceiro && (
            <FormularioParceiro
              defaultValues={{
                nome: selectedParceiro.nome,
                cpf_cnpj: selectedParceiro.cpf_cnpj,
                area_atuacao: selectedParceiro.area_atuacao || "",
                email: selectedParceiro.email || "",
                telefone: selectedParceiro.telefone || "",
                logradouro: selectedParceiro.endereco_completo?.logradouro || "",
                numero: selectedParceiro.endereco_completo?.numero || "",
                complemento: selectedParceiro.endereco_completo?.complemento || "",
                bairro: selectedParceiro.endereco_completo?.bairro || "",
                cidade: selectedParceiro.endereco_completo?.cidade || "",
                estado: selectedParceiro.endereco_completo?.estado || "",
                cep: selectedParceiro.endereco_completo?.cep || "",
              }}
              submitLabel="Salvar alterações"
              onSubmit={async (values) => {
                await onUpdate(selectedParceiro.id, values);
              }}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Inativar */}
      <AlertDialog open={showInativarDialog} onOpenChange={setShowInativarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Inativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja inativar o parceiro "{parceiroToInativar?.nome}"? 
              O parceiro não será excluído, apenas marcado como inativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmInativar} className="bg-destructive hover:bg-destructive/90">
              Inativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ParceirosPage;
