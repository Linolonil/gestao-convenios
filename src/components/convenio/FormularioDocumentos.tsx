import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TipoDocumento {
  id: number;
  nome: string;
  obrigatorio: boolean;
}

interface FileWithType {
  file: File;
  tipoDocumentoId: number | null;
}

interface FormularioDocumentosProps {
  uploadedFiles: Record<string, File>;
  onFileUpload: (tipoDocumentoId: number, file: File) => void;
}

export function FormularioDocumentos({ 
  uploadedFiles, 
  onFileUpload 
}: FormularioDocumentosProps) {
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<FileWithType[]>([]);

  useEffect(() => {
    fetchTiposDocumento();
  }, []);

  const fetchTiposDocumento = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_documento')
        .select('id_tipo_documento, nome, obrigatorio')
        .order('obrigatorio', { ascending: false })
        .order('nome');

      if (error) throw error;
      const mapped = (data || []).map(d => ({
        id: d.id_tipo_documento,
        nome: d.nome,
        obrigatorio: d.obrigatorio
      }));
      setTiposDocumento(mapped);
    } catch (error) {
      console.error('Erro ao carregar tipos de documento:', error);
      toast({
        title: "Erro ao carregar tipos de documento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const validFiles: FileWithType[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: `${file.name} muito grande`,
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive"
        });
        continue;
      }

      // Validar tipo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: `${file.name} - tipo inválido`,
          description: "Envie apenas PDF, imagens (JPG, PNG) ou documentos Word",
          variant: "destructive"
        });
        continue;
      }

      validFiles.push({ file, tipoDocumentoId: null });
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    event.target.value = '';
  };

  const handleTipoChange = (index: number, tipoId: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles[index].tipoDocumentoId = tipoId;
    setSelectedFiles(updatedFiles);
    
    // Atualizar no formulário pai
    onFileUpload(tipoId, updatedFiles[index].file);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return <div>Carregando tipos de documento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Selecionar Arquivos</h3>
        <p className="text-sm text-muted-foreground">
          Selecione um ou mais arquivos do computador. O sistema tentará identificar o Tipo do Arquivo a partir do nome do arquivo selecionado.
        </p>
        <p className="text-sm text-muted-foreground font-medium">
          Tamanho máximo - PDF: 2MB
        </p>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.getElementById('file-input') as HTMLInputElement;
              input?.click();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Escolher Arquivos
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedFiles.length === 0 ? 'Nenhum arquivo escolhido' : `${selectedFiles.length} arquivo(s) selecionado(s)`}
          </span>
        </div>

        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileSelect}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">Tipo do Arquivo</th>
                <th className="text-left p-3 font-medium">Tamanho (KB)</th>
                <th className="text-left p-3 font-medium">Assinado</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {selectedFiles.map((fileWithType, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 text-sm">{fileWithType.file.name}</td>
                  <td className="p-3">
                    <Select
                      value={fileWithType.tipoDocumentoId?.toString() || ''}
                      onValueChange={(value) => handleTipoChange(index, parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- CLIQUE AQUI PARA SELECIONAR --" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {tiposDocumento.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-sm text-center">
                    {Math.round(fileWithType.file.size / 1024)}
                  </td>
                  <td className="p-3 text-sm text-center">Não</td>
                  <td className="p-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Formatos aceitos: PDF, JPG, PNG, DOC, DOCX | Tamanho máximo: 10MB por arquivo
      </p>
    </div>
  );
}