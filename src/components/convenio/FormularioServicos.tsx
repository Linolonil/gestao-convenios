import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FormularioServicosProps {
  servicos: Array<{nome: string; desconto: number}>;
  onAdd: (nome: string, desconto: number) => void;
  onRemove: (index: number) => void;
  onUpdateDesconto: (index: number, desconto: number) => void;
  categoria?: string;
}

export function FormularioServicos({ 
  servicos, 
  onAdd, 
  onRemove,
  onUpdateDesconto,
  categoria 
}: FormularioServicosProps) {
  const [servicosDisponiveis, setServicosDisponiveis] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (categoria) {
      loadServicos();
    }
  }, [categoria]);

  const loadServicos = async () => {
    if (!categoria) return;
    
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('nome')
        .eq('categoria', categoria);

      if (error) throw error;

      const nomes = data.map(s => s.nome).filter(Boolean);
      setServicosDisponiveis(nomes);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const handleAdd = () => {
    if (!searchTerm.trim()) return;
    
    if (!categoria) {
      toast({
        title: "Selecione um segmento primeiro",
        variant: "destructive"
      });
      return;
    }

    // Adicionar serviço localmente ao formulário
    onAdd(searchTerm.trim(), 0);
    
    // Adicionar à lista de serviços disponíveis se ainda não estiver lá
    if (!servicosDisponiveis.includes(searchTerm.trim())) {
      setServicosDisponiveis(prev => [...prev, searchTerm.trim()]);
    }
    
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const filteredSuggestions = servicosDisponiveis.filter(s =>
    s.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !servicos.find(srv => srv.nome === s)
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Serviços Oferecidos</h3>
      
      {!categoria && (
        <p className="text-sm text-muted-foreground">
          Selecione um segmento para adicionar serviços
        </p>
      )}

      {categoria && (
        <>
          <div className="relative space-y-2">
            <Label htmlFor="servico">Adicionar Serviço</Label>
            <div className="flex gap-2">
              <Input
                id="servico"
                placeholder="Digite o nome do serviço"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <Button type="button" onClick={handleAdd}>
                Adicionar
              </Button>
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                {filteredSuggestions.map((sugestao) => (
                  <button
                    key={sugestao}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      onAdd(sugestao, 0);
                      setSearchTerm('');
                      setShowSuggestions(false);
                    }}
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            )}
          </div>

          {servicos.length > 0 && (
            <div className="space-y-3 mt-6">
              <Label>Serviços Adicionados</Label>
              {servicos.map((servico, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{servico.nome}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={servico.desconto}
                        onChange={(e) => onUpdateDesconto(index, parseFloat(e.target.value) || 0)}
                        className="w-28 pr-8"
                        placeholder="0"
                      />
                      <Percent className="h-4 w-4 absolute right-3 text-muted-foreground pointer-events-none" />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
