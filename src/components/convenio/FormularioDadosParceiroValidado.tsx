import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { parceiroDadosSchema, type ParceiroDadosFormValues } from "@/lib/validations/parceiro";

interface FormularioDadosParceiroValidadoProps {
  tipoPessoa: 'fisica' | 'juridica';
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onTipoPessoaChange: (tipo: 'fisica' | 'juridica') => void;
}

export function FormularioDadosParceiroValidado({ 
  tipoPessoa, 
  formData, 
  onChange,
  onTipoPessoaChange
}: FormularioDadosParceiroValidadoProps) {
  
  const {
    register,
    formState: { errors },
    trigger
  } = useForm<ParceiroDadosFormValues>({
    resolver: zodResolver(parceiroDadosSchema),
    mode: 'onChange',
    values: {
      tipoPessoa,
      ...(tipoPessoa === 'juridica' ? {
        cnpj: formData.cnpj || '',
        razaoSocial: formData.razaoSocial || '',
        nomeFantasia: formData.nomeFantasia || '',
        responsavel: formData.responsavel || '',
      } : {
        cpf: formData.cpf || '',
        nomeFantasia: formData.nomeFantasia || '',
        dataNascimento: formData.dataNascimento || '',
      }),
      emailContato: formData.emailContato || '',
      telefoneContato: formData.telefoneContato || '',
      enderecoComercial: formData.enderecoComercial || '',
    } as ParceiroDadosFormValues
  });
  
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
      
      // Revalidar campos preenchidos
      setTimeout(() => trigger(), 100);
    } catch (error) {
      toast({ 
        title: "Erro ao buscar CNPJ", 
        description: "Verifique o número e tente novamente",
        variant: "destructive" 
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    onChange(field, value);
    setTimeout(() => trigger(field as any), 100);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dados do Parceiro</h3>
      
      <div className="space-y-2">
        <Label>Tipo de Pessoa *</Label>
        <RadioGroup 
          value={tipoPessoa} 
          onValueChange={(v: 'fisica' | 'juridica') => onTipoPessoaChange(v)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="juridica" id="juridica" />
            <Label htmlFor="juridica">Pessoa Jurídica</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fisica" id="fisica" />
            <Label htmlFor="fisica">Pessoa Física</Label>
          </div>
        </RadioGroup>
      </div>
      
      {tipoPessoa === 'juridica' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Input
                  id="cnpj"
                  {...register('cnpj')}
                  value={formData.cnpj || ''}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
                {'cnpj' in errors && errors.cnpj && (
                  <p className="text-sm text-destructive">{errors.cnpj.message}</p>
                )}
              </div>
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
              {...register('razaoSocial')}
              value={formData.razaoSocial || ''}
              onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
            />
            {'razaoSocial' in errors && errors.razaoSocial && (
              <p className="text-sm text-destructive">{errors.razaoSocial.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
            <Input
              id="nomeFantasia"
              {...register('nomeFantasia')}
              value={formData.nomeFantasia || ''}
              onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
            />
            {errors.nomeFantasia && (
              <p className="text-sm text-destructive">{errors.nomeFantasia.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável Legal</Label>
            <Input
              id="responsavel"
              {...register('responsavel')}
              value={formData.responsavel || ''}
              onChange={(e) => handleInputChange('responsavel', e.target.value)}
              placeholder="Nome do responsável"
            />
            {'responsavel' in errors && errors.responsavel && (
              <p className="text-sm text-destructive">{errors.responsavel.message}</p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              {...register('cpf')}
              value={formData.cpf || ''}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              placeholder="000.000.000-00"
            />
            {'cpf' in errors && errors.cpf && (
              <p className="text-sm text-destructive">{errors.cpf.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeProfissional">Nome Completo *</Label>
            <Input
              id="nomeProfissional"
              {...register('nomeFantasia')}
              value={formData.nomeFantasia || ''}
              onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
            />
            {errors.nomeFantasia && (
              <p className="text-sm text-destructive">{errors.nomeFantasia.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
            <Input
              id="dataNascimento"
              type="date"
              {...register('dataNascimento')}
              value={formData.dataNascimento || ''}
              onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
            />
            {'dataNascimento' in errors && errors.dataNascimento && (
              <p className="text-sm text-destructive">{errors.dataNascimento.message}</p>
            )}
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="emailContato">Email *</Label>
        <Input
          id="emailContato"
          type="email"
          {...register('emailContato')}
          value={formData.emailContato || ''}
          onChange={(e) => handleInputChange('emailContato', e.target.value)}
        />
        {errors.emailContato && (
          <p className="text-sm text-destructive">{errors.emailContato.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefoneContato">Telefone *</Label>
        <Input
          id="telefoneContato"
          {...register('telefoneContato')}
          value={formData.telefoneContato || ''}
          onChange={(e) => handleInputChange('telefoneContato', e.target.value)}
          placeholder="(00) 00000-0000"
        />
        {errors.telefoneContato && (
          <p className="text-sm text-destructive">{errors.telefoneContato.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="enderecoComercial">Endereço Completo *</Label>
        <Input
          id="enderecoComercial"
          {...register('enderecoComercial')}
          value={formData.enderecoComercial || ''}
          onChange={(e) => handleInputChange('enderecoComercial', e.target.value)}
        />
        {errors.enderecoComercial && (
          <p className="text-sm text-destructive">{errors.enderecoComercial.message}</p>
        )}
      </div>
    </div>
  );
}
