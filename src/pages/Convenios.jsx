import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ArrowLeft, FileText, MoreHorizontal, Zap, Ban, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Convenios = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [convenios, setConvenios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [conveniosServicos, setConveniosServicos] = useState({});
  const [conveniosDescontos, setConveniosDescontos] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [convenioToReprove, setConvenioToReprove] = useState(null);
  const [convenioToActivate, setConvenioToActivate] = useState(null);
  const [numeroContrato, setNumeroContrato] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchConvenios();

    // Configurar real-time updates
    const channel = supabase
      .channel('contratos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contratos'
        },
        (payload) => {
          console.log('Convênio atualizado:', payload);
          fetchConvenios();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Se houver um estado de navegação com selectedStatus, definir automaticamente
    if (location.state?.selectedStatus) {
      setSelectedStatus(location.state.selectedStatus);
    }
  }, [location.state]);

  const fetchConvenios = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          *,
          parceiros (
            nome,
            tipo_pessoa,
            cpf,
            cnpj
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conveniosTyped = (data || []).map(c => ({
        ...c,
        parceiro: c.parceiros
      }));

      setConvenios(conveniosTyped);
      
      // Otimização: Buscar todos os serviços de uma vez ao invés de em loop
      if (conveniosTyped.length > 0) {
        const contratoIds = conveniosTyped.map(c => c.id_contrato);
        const { data: servicosData } = await supabase
          .from('servicos_oferecidos')
          .select(`
            id_contrato,
            desconto_concedido,
            servicos (
              nome
            )
          `)
          .in('id_contrato', contratoIds);
        
        // Agrupar serviços e descontos por contrato
        const servicosMap = {};
        const descontosMap = {};
        
        if (servicosData) {
          servicosData.forEach(s => {
            if (!servicosMap[s.id_contrato]) {
              servicosMap[s.id_contrato] = [];
            }
            
            const nome = s.servicos?.nome;
            if (nome) {
              servicosMap[s.id_contrato].push(nome);
            }
            
            // Guardar primeiro desconto válido encontrado
            if (!descontosMap[s.id_contrato] && s.desconto_concedido != null && s.desconto_concedido > 0) {
              descontosMap[s.id_contrato] = s.desconto_concedido;
            }
          });
          
          // Converter arrays de serviços em strings
          Object.keys(servicosMap).forEach(key => {
            servicosMap[key] = servicosMap[key].join(', ');
          });
        }
        
        setConveniosServicos(servicosMap);
        setConveniosDescontos(descontosMap);
      }
    } catch (error) {
      console.error('Error fetching convenios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar convênios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    ATIVO: { label: 'Ativos', variant: 'default' },
    EM_ANALISE: { label: 'Em análise', variant: 'secondary' },
    EM_NEGOCIACAO: { label: 'Em negociação', variant: 'accent' },
    RENOVACAO: { label: 'Renovação', variant: 'outline' },
    ENCERRADO: { label: 'Encerrados', variant: 'destructive' }
  };

  const getStatusCount = (status) => {
    return convenios.filter(c => c.status === status).length;
  };

  const filteredConvenios = convenios
    .filter(c => selectedStatus ? c.status === selectedStatus : true)
    .filter(c => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const parceiroNome = c.parceiro?.nome?.toLowerCase() || '';
      const numero = (c.numero || `#${c.id_contrato}`).toLowerCase();
      const cpfCnpj = (c.parceiro?.cpf || c.parceiro?.cnpj || '').toLowerCase();
      return parceiroNome.includes(search) || numero.includes(search) || cpfCnpj.includes(search);
    });

  // Paginação
  const totalPages = Math.ceil(filteredConvenios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedConvenios = filteredConvenios.slice(startIndex, endIndex);

  // Reset para página 1 quando mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const formatDataCadastro = (createdAt) => {
    if (!createdAt) return '-';
    const date = new Date(createdAt);
    return date.toLocaleDateString('pt-BR');
  };

  const formatDataHora = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const formatDataExpiracao = (dateString) => {
    if (!dateString) return { text: '-', isExpired: false };
    const date = new Date(dateString);
    const now = new Date();
    const isExpired = date < now;
    
    const formatted = date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
    
    return { text: formatted, isExpired };
  };

  const getStatusBadgeVariant = (status) => {
    if (status === 'ATIVO') return 'default';
    if (status === 'ENCERRADO') return 'destructive';
    return 'secondary';
  };

  const handleAprovarConvenio = async (idContrato) => {
    try {
      // Verificar se todos os documentos do contrato estão aprovados
      const { data: documentos, error: docError } = await supabase
        .from('documentos')
        .select('id_documento, status, nome')
        .eq('id_contrato', idContrato);

      if (docError) throw docError;

      // Verificar se existem documentos
      if (!documentos || documentos.length === 0) {
        toast({
          title: "Impossível aprovar",
          description: "Este convênio não possui documentos anexados",
          variant: "destructive",
        });
        return;
      }

      // Verificar se todos os documentos estão aprovados
      const documentosPendentes = documentos.filter(doc => doc.status !== 'aprovado');
      
      if (documentosPendentes.length > 0) {
        const statusDescricao = documentosPendentes.map(doc => {
          const statusMap = {
            pendente: 'pendente',
            rejeitado: 'rejeitado',
            em_correcao: 'em correção'
          };
          return `${doc.nome} (${statusMap[doc.status] || doc.status})`;
        }).join(', ');

        toast({
          title: "Impossível aprovar",
          description: `Existem ${documentosPendentes.length} documento(s) não aprovado(s): ${statusDescricao}. Todos os documentos devem estar aprovados antes de aprovar o convênio.`,
          variant: "destructive",
        });
        return;
      }

      // Todos os documentos estão aprovados, pode prosseguir
      const { error } = await supabase
        .from('contratos')
        .update({ status: 'EM_NEGOCIACAO' })
        .eq('id_contrato', idContrato);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Convênio aprovado e movido para negociação",
      });

      fetchConvenios();
    } catch (error) {
      console.error('Error approving convenio:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar convênio",
        variant: "destructive",
      });
    }
  };

  const handleReprovarConvenio = async () => {
    if (!convenioToReprove) return;

    try {
      // Deletar documentos associados ao contrato
      const { error: docError } = await supabase
        .from('documentos')
        .delete()
        .eq('id_contrato', convenioToReprove.id_contrato);

      if (docError) throw docError;

      // Deletar serviços oferecidos associados ao contrato
      const { error: servicosError } = await supabase
        .from('servicos_oferecidos')
        .delete()
        .eq('id_contrato', convenioToReprove.id_contrato);

      if (servicosError) throw servicosError;

      // Deletar o contrato
      const { error: contratoError } = await supabase
        .from('contratos')
        .delete()
        .eq('id_contrato', convenioToReprove.id_contrato);

      if (contratoError) throw contratoError;

      // Deletar o parceiro
      const { error: parceiroError } = await supabase
        .from('parceiros')
        .delete()
        .eq('id_parceiro', convenioToReprove.id_parceiro);

      if (parceiroError) throw parceiroError;

      toast({
        title: "Sucesso",
        description: "Contrato reprovado e removido com sucesso",
      });

      setConvenioToReprove(null);
      fetchConvenios();
    } catch (error) {
      console.error('Error reproving convenio:', error);
      toast({
        title: "Erro",
        description: "Erro ao reprovar contrato",
        variant: "destructive",
      });
    }
  };

  const handleAtivarConvenio = async () => {
    if (!convenioToActivate) return;

    if (!numeroContrato.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o número do contrato",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataInicio = new Date();
      const dataFim = new Date(dataInicio);
      dataFim.setFullYear(dataFim.getFullYear() + 3);

      const { error } = await supabase
        .from('contratos')
        .update({ 
          status: 'ATIVO',
          numero: numeroContrato.trim(),
          data_inicio: dataInicio.toISOString().split('T')[0],
          data_fim: dataFim.toISOString().split('T')[0]
        })
        .eq('id_contrato', convenioToActivate.id_contrato);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Convênio ativado com sucesso",
      });

      setConvenioToActivate(null);
      setNumeroContrato('');
      setSelectedStatus('ATIVO');
      fetchConvenios();
    } catch (error) {
      console.error('Error activating convenio:', error);
      toast({
        title: "Erro",
        description: "Erro ao ativar convênio",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedStatus !== null) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSelectedStatus(null)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              Convênios - {statusConfig[selectedStatus]?.label}
            </h1>
            <p className="text-muted-foreground">
              {filteredConvenios.length} convênio(s) encontrado(s)
            </p>
          </div>
          <Button onClick={() => navigate('/convenios/novo')}>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
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

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedStatus === 'ATIVO' ? (
                    <>
                      <TableHead>NÚMERO</TableHead>
                      <TableHead>PARCEIRO</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>SERVIÇO</TableHead>
                      <TableHead>INICIO EM</TableHead>
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
                      {(selectedStatus === 'EM_ANALISE' || selectedStatus === 'EM_NEGOCIACAO') && <TableHead>Ações</TableHead>}
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedConvenios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedStatus === 'ATIVO' ? 7 : (selectedStatus === 'EM_ANALISE' || selectedStatus === 'EM_NEGOCIACAO') ? 6 : 5} className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Nenhum convênio encontrado para a busca' : 'Nenhum convênio encontrado'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedConvenios.map((convenio) => {
                    if (selectedStatus === 'ATIVO') {
                      const expiracao = formatDataExpiracao(convenio.data_fim);
                      return (
                        <TableRow key={convenio.id_contrato}>
                          <TableCell className="whitespace-nowrap">
                            <button
                              onClick={() => navigate(`/convenios/${convenio.id_contrato}`, { 
                                state: { selectedStatus } 
                              })}
                              className="text-primary hover:underline font-medium"
                            >
                              {convenio.numero || `#${convenio.id_contrato}`}
                            </button>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{convenio.parceiro?.nome || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">{convenio.parceiro?.cpf || convenio.parceiro?.cnpj || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {conveniosServicos[convenio.id_contrato] || 'Nenhum serviço'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{formatDataHora(convenio.data_inicio)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={expiracao.isExpired ? 'destructive' : 'secondary'}>
                              {expiracao.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" title="Editar">
                                <Zap className="w-4 h-4 text-yellow-600" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Cancelar">
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
                            onClick={() => navigate(`/convenios/${convenio.id_contrato}`, { 
                              state: { selectedStatus } 
                            })}
                            className="text-primary hover:underline font-medium"
                          >
                            {convenio.numero || `#${convenio.id_contrato}`}
                          </button>
                        </TableCell>
                        <TableCell>{convenio.parceiro?.nome || '-'}</TableCell>
                        <TableCell>{conveniosServicos[convenio.id_contrato] || '-'}</TableCell>
                        <TableCell>
                          {conveniosDescontos[convenio.id_contrato] 
                            ? `${conveniosDescontos[convenio.id_contrato]}%` 
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{formatDataCadastro(convenio.created_at)}</TableCell>
                        {selectedStatus === 'EM_ANALISE' && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleAprovarConvenio(convenio.id_contrato)}>
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
                        {selectedStatus === 'EM_NEGOCIACAO' && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setConvenioToActivate(convenio)}>
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
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Mostrar apenas algumas páginas ao redor da atual
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <AlertDialog open={!!convenioToReprove} onOpenChange={() => setConvenioToReprove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reprovar Contrato</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja reprovar este contrato? Esta ação irá deletar permanentemente o contrato, o parceiro e todos os documentos associados. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleReprovarConvenio} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sim, reprovar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!convenioToActivate} onOpenChange={() => {
          setConvenioToActivate(null);
          setNumeroContrato('');
        }}>
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
              <AlertDialogAction onClick={handleAtivarConvenio}>
                Ativar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = getStatusCount(status);
          return (
            <Card 
              key={status}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedStatus(status)}
            >
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                  <p className="text-3xl font-bold text-primary">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Convenios;
