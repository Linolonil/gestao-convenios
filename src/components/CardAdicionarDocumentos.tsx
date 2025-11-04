import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileWithType {
  file: File;
  tipoDocumentoId: number | null;
}

interface TipoDocumento {
  id_tipo_documento: number;
  nome: string;
  obrigatorio: boolean;
}

interface CardAdicionarDocumentosProps {
  idContrato: number;
  onDocumentosAdicionados: () => void;
}

const CardAdicionarDocumentos = ({ idContrato, onDocumentosAdicionados }: CardAdicionarDocumentosProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithType[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(false);
  const [tipoDocumentoSelecionado, setTipoDocumentoSelecionado] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Carregar tipos de documento ao montar
  useEffect(() => {
    const fetchTiposDocumento = async () => {
      const { data, error } = await supabase
        .from("tipos_documento")
        .select("id_tipo_documento, nome, obrigatorio")
        .order("nome");

      if (!error && data) {
        setTiposDocumento(data);
      }
    };
    fetchTiposDocumento();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: FileWithType[] = [];
    const maxSize = 2 * 1024 * 1024; // 2MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validar tamanho
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o tamanho máximo de 2MB`,
          variant: "destructive",
        });
        continue;
      }

      // Validar tipo
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: `${file.name} não é um formato aceito (PDF, JPG, PNG)`,
          variant: "destructive",
        });
        continue;
      }

      newFiles.push({ file, tipoDocumentoId: tipoDocumentoSelecionado });
    }

    setSelectedFiles([...selectedFiles, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTipoChange = (index: number, tipoId: string) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles[index].tipoDocumentoId = parseInt(tipoId);
    setSelectedFiles(updatedFiles);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const handleUpload = async () => {
    // Validar que todos os arquivos têm tipo selecionado
    const filesWithoutType = selectedFiles.filter(f => !f.tipoDocumentoId);
    if (filesWithoutType.length > 0) {
      toast({
        title: "Tipo de documento não selecionado",
        description: "Por favor, selecione o tipo para todos os arquivos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      for (const fileData of selectedFiles) {
        const { file, tipoDocumentoId } = fileData;
        
        // Upload do arquivo para o storage
        const filePath = `${idContrato}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("convenio-documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Inserir registro na tabela documentos
        const { error: dbError } = await supabase
          .from("documentos")
          .insert({
            id_contrato: idContrato,
            id_tipo_documento: tipoDocumentoId,
            nome: file.name,
            caminho_arquivo: filePath,
            status: "pendente",
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Sucesso",
        description: "Documentos adicionados com sucesso",
      });

      setSelectedFiles([]);
      onDocumentosAdicionados();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar documentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Selecionar Arquivos
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Selecione um ou mais arquivos do computador. O sistema tentará identificar o Tipo do Arquivo a partir do nome do arquivo selecionado.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Tamanho máximo - PDF: 2MB
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tipo do Documento</label>
            <Select
              value={tipoDocumentoSelecionado?.toString() || ""}
              onValueChange={(value) => setTipoDocumentoSelecionado(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- SELECIONE O TIPO DE DOCUMENTO --" />
              </SelectTrigger>
              <SelectContent>
                {tiposDocumento.map((tipo) => (
                  <SelectItem
                    key={tipo.id_tipo_documento}
                    value={tipo.id_tipo_documento.toString()}
                  >
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || !tipoDocumentoSelecionado}
            >
              Escolher Arquivos
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedFiles.length === 0 
                ? "Nenhum arquivo escolhido" 
                : `${selectedFiles.length} arquivo(s) selecionado(s)`}
            </span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />

        {selectedFiles.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-medium w-12"></th>
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">
                    Tipo do Arquivo
                  </th>
                  <th className="text-left p-3 text-sm font-medium w-32">Tamanho (KB)</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {selectedFiles.map((fileData, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3"></td>
                    <td className="p-3 text-sm">{fileData.file.name}</td>
                    <td className="p-3">
                      <Select
                        value={fileData.tipoDocumentoId?.toString() || ""}
                        onValueChange={(value) => handleTipoChange(index, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="-- CLIQUE AQUI PARA SELECIONAR --" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposDocumento.map((tipo) => (
                            <SelectItem
                              key={tipo.id_tipo_documento}
                              value={tipo.id_tipo_documento.toString()}
                            >
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-sm text-center">
                      {formatFileSize(fileData.file.size)}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
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

        {selectedFiles.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={loading}>
              {loading ? "Enviando..." : "Enviar Documentos"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardAdicionarDocumentos;
