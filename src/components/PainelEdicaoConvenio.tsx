import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConvenioEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  convenioId: number | null;
  onSuccess: () => void;
}

const PainelEdicaoConvenio: React.FC<ConvenioEditSheetProps> = ({
  open, 
  onOpenChange, 
  convenioId,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [nomeOrganizacao, setNomeOrganizacao] = useState('');
  const [pessoaContato, setPessoaContato] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoParceria, setTipoParceria] = useState('');
  const [status, setStatus] = useState('');
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataTermino, setDataTermino] = useState<Date>();
  const [dataRenovacao, setDataRenovacao] = useState<Date>();
  const [servicos, setServicos] = useState<Array<{id: number; nome: string; descricao: string | null}>>([]);

  useEffect(() => {
    if (open && convenioId) {
      loadConvenio();
    } else {
      resetForm();
    }
  }, [open, convenioId]);

  const resetForm = () => {
    setNomeOrganizacao('');
    setPessoaContato('');
    setEmail('');
    setTelefone('');
    setTipoParceria('');
    setStatus('');
    setDataInicio(undefined);
    setDataTermino(undefined);
    setDataRenovacao(undefined);
    setServicos([]);
  };

  const loadConvenio = async () => {
    if (!convenioId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          *,
          parceiros (*)
        `)
        .eq('id_contrato', convenioId)
        .single();

      if (error) throw error;

      if (data) {
        setNomeOrganizacao(data.parceiros?.nome || '');
        setPessoaContato(data.parceiros?.responsavel || '');
        setEmail(data.parceiros?.email || '');
        setTelefone(data.parceiros?.telefone || '');
        setStatus(data.status || '');
        
        // Carregar serviços oferecidos no contrato
        const { data: servicosOferecidos } = await supabase
          .from('servicos_oferecidos')
          .select(`
            servicos (
              id_servico,
              nome,
              descricao
            )
          `)
          .eq('id_contrato', convenioId);
        
        if (servicosOferecidos && servicosOferecidos.length > 0) {
          const servicosList = servicosOferecidos
            .filter(so => so.servicos)
            .map(so => ({
              id: so.servicos.id_servico,
              nome: so.servicos.nome,
              descricao: so.servicos.descricao
            }));
          setServicos(servicosList);
        }
      }
    } catch (error) {
      console.error('Error loading convenio:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do convênio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!convenioId || !nomeOrganizacao || !email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e e-mail",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { data: contrato } = await supabase
        .from('contratos')
        .select('id_parceiro')
        .eq('id_contrato', convenioId)
        .single();

      if (contrato?.id_parceiro) {
        await supabase
          .from('parceiros')
          .update({
            nome: nomeOrganizacao,
            email: email,
            telefone: telefone,
            responsavel: pessoaContato,
          })
          .eq('id_parceiro', contrato.id_parceiro);
      }

      await supabase
        .from('contratos')
        .update({
          status: (status as "ATIVO" | "EM_ANALISE" | "EM_NEGOCIACAO" | "ENCERRADO" | "RENOVACAO") || 'EM_ANALISE',
        })
        .eq('id_contrato', convenioId);

      toast({ title: "Convênio atualizado" });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Convênio</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Informações</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeOrganizacao">Nome da Organização *</Label>
                <Input
                  id="nomeOrganizacao"
                  placeholder="Ex: Hospital Santa Mônica"
                  value={nomeOrganizacao}
                  onChange={(e) => setNomeOrganizacao(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pessoaContato">Pessoa de Contato *</Label>
                <Input
                  id="pessoaContato"
                  placeholder="Ex: Dr. Maria Silva"
                  value={pessoaContato}
                  onChange={(e) => setPessoaContato(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@exemplo.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(92) 3234-5678"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Detalhes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoParceria">Tipo de Parceria</Label>
                <Select value={tipoParceria} onValueChange={setTipoParceria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="juridica - saude">Saúde</SelectItem>
                    <SelectItem value="juridica - ensino">Ensino</SelectItem>
                    <SelectItem value="juridica - alimentacao">Alimentação</SelectItem>
                    <SelectItem value="fisica - saude">Saúde (PF)</SelectItem>
                    <SelectItem value="fisica - simples">Serviços</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prospecção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataInicio && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "dd/mm/aaaa"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dataInicio} onSelect={setDataInicio} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data de Término</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataTermino && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataTermino ? format(dataTermino, "dd/MM/yyyy") : "dd/mm/aaaa"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dataTermino} onSelect={setDataTermino} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data de Renovação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataRenovacao && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataRenovacao ? format(dataRenovacao, "dd/MM/yyyy") : "dd/mm/aaaa"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dataRenovacao} onSelect={setDataRenovacao} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Serviços Oferecidos</h3>
            <div className="space-y-2">
              {servicos.length > 0 ? (
                <div className="space-y-2">
                  {servicos.map((servico, index) => (
                    <div key={servico.id} className="p-3 border rounded-lg bg-muted/50">
                      <p className="font-medium">{servico.nome}</p>
                      {servico.descricao && servico.descricao !== servico.nome && (
                        <p className="text-sm text-muted-foreground">{servico.descricao}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PainelEdicaoConvenio;
