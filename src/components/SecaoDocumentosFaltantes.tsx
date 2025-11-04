import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TipoDocumento {
  id: number;
  nome: string;
  descricao: string;
  obrigatorio: boolean;
  prazo_validade_dias: number | null;
}

interface DocumentoRequerido {
  id: string;
  nome: string;
  categoria: string;
  obrigatorio: boolean;
  tipo_documento_id?: number;
}

interface DocumentoExistente {
  categoria_documento?: string;
  nome_arquivo: string;
}

interface MissingDocumentsSectionProps {
  convenioId: number;
  tipoConvenio: string;
  documentosExistentes: DocumentoExistente[];
  onDocumentUploaded: () => void;
}

// Define required documents for each convenio type
const getRequiredDocuments = (tipoConvenio: string): DocumentoRequerido[] => {
  const baseDocuments: DocumentoRequerido[] = [
    { id: 'contrato-social', nome: 'Contrato Social', categoria: 'Contrato Social', obrigatorio: true },
    { id: 'cnpj', nome: 'Cartão CNPJ', categoria: 'Cartão CNPJ', obrigatorio: true },
    { id: 'rg-responsavel', nome: 'RG do Responsável', categoria: 'RG - Documento de Identidade', obrigatorio: true },
    { id: 'cpf-responsavel', nome: 'CPF do Responsável', categoria: 'CPF - Cadastro de Pessoa Física', obrigatorio: true },
    { id: 'comprovante-endereco', nome: 'Comprovante de Endereço', categoria: 'Comprovante de Endereço', obrigatorio: true },
  ];

  const specificDocuments: Record<string, DocumentoRequerido[]> = {
    'Prestação de Serviços': [
      ...baseDocuments,
      { id: 'alvara', nome: 'Alvará de Funcionamento', categoria: 'Alvará de Funcionamento', obrigatorio: false },
    ],
    'Fornecimento': [
      ...baseDocuments,
      { id: 'alvara', nome: 'Alvará de Funcionamento', categoria: 'Alvará de Funcionamento', obrigatorio: true },
    ],
    'Parceria Tecnológica': [
      ...baseDocuments,
      { id: 'estatuto', nome: 'Estatuto Social', categoria: 'Estatuto Social', obrigatorio: false },
    ],
  };

  return specificDocuments[tipoConvenio] || baseDocuments;
};

const SecaoDocumentosFaltantes: React.FC<MissingDocumentsSectionProps> = ({
  convenioId,
  tipoConvenio,
  documentosExistentes,
  onDocumentUploaded,
}) => {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [selectedTipoDocumento, setSelectedTipoDocumento] = useState<Record<string, number>>({});
  
  useEffect(() => {
    fetchTiposDocumento();
  }, []);

  const fetchTiposDocumento = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_documento')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      const mapped = (data || []).map(d => ({
        id: d.id_tipo_documento,
        nome: d.nome,
        descricao: d.descricao || '',
        obrigatorio: d.obrigatorio,
        prazo_validade_dias: d.prazo_validade_dias
      }));
      setTiposDocumento(mapped);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };
  
  const requiredDocuments = getRequiredDocuments(tipoConvenio);
  
  // Find missing documents by comparing categories
  const missingDocuments = requiredDocuments.filter(reqDoc => {
    return !documentosExistentes.some(existingDoc => 
      existingDoc.categoria_documento === reqDoc.categoria
    );
  });

  const handleFileUpload = async (documentoId: string, file: File) => {
    if (!file) return;

    // Verificar se o tipo de documento foi selecionado
    const tipoDocId = selectedTipoDocumento[documentoId];
    if (!tipoDocId) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de documento antes de fazer o upload",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não permitido",
        description: "Permitidos: PDF, DOC, DOCX, JPG, PNG, GIF",
        variant: "destructive",
      });
      return;
    }

    setUploading(prev => ({ ...prev, [documentoId]: true }));

    try {
      // Upload file to Supabase storage
      // Sanitizar o nome do arquivo removendo caracteres especiais
      const sanitizedFileName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-zA-Z0-9._-]/g, '_'); // Substitui caracteres especiais por underscore
      
      const fileName = `${convenioId}/${Date.now()}_${sanitizedFileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('convenio-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the tipo_documento name
      const tipoDoc = tiposDocumento.find(t => t.id === tipoDocId);
      if (!tipoDoc) throw new Error('Tipo de documento não encontrado');

      // Save document record to database
      const { error: dbError } = await supabase
        .from('documentos')
        .insert({
          id_contrato: convenioId,
          nome: file.name,
          caminho_arquivo: uploadData.path,
          status: 'pendente',
          id_tipo_documento: tipoDocId,
        });

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!",
      });

      // Limpar seleção
      setSelectedTipoDocumento(prev => {
        const newState = { ...prev };
        delete newState[documentoId];
        return newState;
      });

      onDocumentUploaded();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({ ...prev, [documentoId]: false }));
    }
  };

  const triggerFileInput = (documentoId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(documentoId, file);
      }
    };
    input.click();
  };

  const getFileIcon = (categoria: string) => {
    if (categoria.includes('RG') || categoria.includes('CPF')) return '🆔';
    if (categoria.includes('CNPJ')) return '🏢';
    if (categoria.includes('Contrato')) return '📋';
    if (categoria.includes('Comprovante')) return '🏠';
    if (categoria.includes('Alvará')) return '📜';
    return '📄';
  };

  if (missingDocuments.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Todos os documentos foram enviados</p>
              <p className="text-sm text-green-600">Este convênio possui todos os documentos necessários.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Documentos Faltantes ({missingDocuments.length})
        </CardTitle>
        <p className="text-sm text-orange-700">
          Os seguintes documentos ainda não foram enviados para análise:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {missingDocuments.map((documento) => (
            <div
              key={documento.id}
              className={`border rounded-lg p-4 transition-all bg-white ${
                documento.obrigatorio 
                  ? 'border-red-200' 
                  : 'border-gray-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(documento.categoria)}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {documento.nome}
                        </span>
                        {documento.obrigatorio ? (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatório
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Opcional
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {documento.categoria}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label htmlFor={`tipo-${documento.id}`} className="text-xs mb-1">
                      Tipo de Documento *
                    </Label>
                    <Select 
                      value={selectedTipoDocumento[documento.id]?.toString() || ''} 
                      onValueChange={(value) => setSelectedTipoDocumento(prev => ({ 
                        ...prev, 
                        [documento.id]: parseInt(value) 
                      }))}
                    >
                      <SelectTrigger id={`tipo-${documento.id}`} className="h-9">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDocumento.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.nome}
                            {tipo.obrigatorio && <span className="text-red-600 ml-1">*</span>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerFileInput(documento.id)}
                    disabled={uploading[documento.id] || !selectedTipoDocumento[documento.id]}
                    className="min-w-[140px] h-9"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading[documento.id] ? 'Enviando...' : 'Fazer Upload'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-700 font-medium mb-1">
            Instruções para upload:
          </p>
          <p className="text-xs text-orange-600">
            • Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, GIF<br/>
            • Tamanho máximo: 10MB por arquivo<br/>
            • Documentos obrigatórios devem ser enviados para aprovação do convênio
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecaoDocumentosFaltantes;