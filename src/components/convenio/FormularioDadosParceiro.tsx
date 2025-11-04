import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormularioDadosParceiroProps {
  tipoPessoa: 'fisica' | 'juridica';
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export function FormularioDadosParceiro({ 
  tipoPessoa, 
  formData, 
  onChange 
}: FormularioDadosParceiroProps) {
  
  const buscarDadosCnpj = async (cnpj: string) => {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      
      if (!response.ok) throw new Error('CNPJ não encontrado');
      
      const data = await response.json();
      
      onChange('razaoSocial', data.razao_social || '');
      onChange('nomeFantasia', data.nome_fantasia || data.razao_social || '');
      onChange('emailContato', data.email || '');
      onChange('telefoneContato', data.ddd_telefone_1 || '');
      
      if (data.logradouro) {
        const endereco = `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio}/${data.uf}`;
        onChange('enderecoComercial', endereco);
      }
      
      toast({ title: "Dados do CNPJ carregados com sucesso!" });
    } catch (error) {
      toast({ 
        title: "Erro ao buscar CNPJ", 
        description: "Verifique o número e tente novamente",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dados do Parceiro</h3>
      
      {tipoPessoa === 'juridica' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <div className="flex gap-2">
              <Input
                id="cnpj"
                value={formData.cnpj || ''}
                onChange={(e) => onChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
                required
              />
              <Button 
                type="button"
                variant="outline"
                onClick={() => formData.cnpj && buscarDadosCnpj(formData.cnpj)}
              >
                Buscar
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="razaoSocial">Razão Social</Label>
            <Input
              id="razaoSocial"
              value={formData.razaoSocial || ''}
              onChange={(e) => onChange('razaoSocial', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
            <Input
              id="nomeFantasia"
              value={formData.nomeFantasia || ''}
              onChange={(e) => onChange('nomeFantasia', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável Legal</Label>
            <Input
              id="responsavel"
              value={formData.responsavel || ''}
              onChange={(e) => onChange('responsavel', e.target.value)}
              placeholder="Nome do responsável"
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={formData.cpf || ''}
              onChange={(e) => onChange('cpf', e.target.value)}
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeProfissional">Nome Completo *</Label>
            <Input
              id="nomeProfissional"
              value={formData.nomeFantasia || ''}
              onChange={(e) => onChange('nomeFantasia', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
            <Input
              id="dataNascimento"
              type="date"
              value={formData.dataNascimento || ''}
              onChange={(e) => onChange('dataNascimento', e.target.value)}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="emailContato">Email *</Label>
        <Input
          id="emailContato"
          type="email"
          value={formData.emailContato || ''}
          onChange={(e) => onChange('emailContato', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefoneContato">Telefone *</Label>
        <Input
          id="telefoneContato"
          value={formData.telefoneContato || ''}
          onChange={(e) => onChange('telefoneContato', e.target.value)}
          placeholder="(00) 00000-0000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="enderecoComercial">Endereço Completo *</Label>
        <Input
          id="enderecoComercial"
          value={formData.enderecoComercial || ''}
          onChange={(e) => onChange('enderecoComercial', e.target.value)}
          required
        />
      </div>
    </div>
  );
}