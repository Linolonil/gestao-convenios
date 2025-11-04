import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DocumentoRequerido {
  id: string;
  nome: string;
  obrigatorio: boolean;
}

interface FileUploadSectionProps {
  documentos: DocumentoRequerido[];
  uploadedFiles: Record<string, File>;
  onFileUpload: (documentoId: string, file: File) => void;
}

const SecaoUploadArquivo: React.FC<FileUploadSectionProps> = ({
  documentos,
  uploadedFiles,
  onFileUpload,
}) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = (documentoId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

      onFileUpload(documentoId, file);
    }
  };

  const triggerFileInput = (documentoId: string) => {
    const input = fileInputRefs.current[documentoId];
    if (input) {
      input.click();
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return '🖼️';
    } else if (extension === 'pdf') {
      return '📄';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return '📝';
    }
    return '📎';
  };

  if (documentos.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documentos Solicitados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {documentos.map((documento) => {
            const isUploaded = !!uploadedFiles[documento.id];
            const uploadedFile = uploadedFiles[documento.id];

            return (
              <div
                key={documento.id}
                className={`border rounded-lg p-4 transition-all ${
                  isUploaded 
                    ? 'border-secondary bg-secondary/5' 
                    : documento.obrigatorio 
                    ? 'border-destructive/30 bg-destructive/5' 
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="font-medium text-sm">
                        {documento.nome}
                      </Label>
                      {documento.obrigatorio ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Obrigatório
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Opcional
                        </Badge>
                      )}
                    </div>
                    
                    {isUploaded && uploadedFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{getFileIcon(uploadedFile.name)}</span>
                        <span className="truncate">{uploadedFile.name}</span>
                        <span className="text-xs">
                          ({(uploadedFile.size / 1024).toFixed(1)} KB)
                        </span>
                        <Check className="w-4 h-4 text-secondary ml-auto" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button
                      type="button"
                      variant={isUploaded ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => triggerFileInput(documento.id)}
                      className="min-w-[120px]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploaded ? 'Alterar' : 'Selecionar'}
                    </Button>
                    
                    <input
                      ref={(el) => {
                        fileInputRefs.current[documento.id] = el;
                      }}
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => handleFileSelect(documento.id, e)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Formatos aceitos:</h4>
          <p className="text-xs text-muted-foreground">
            PDF, DOC, DOCX, JPG, JPEG, PNG, GIF (máximo 10MB por arquivo)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente Label simples para manter consistência
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <label className={`block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

export default SecaoUploadArquivo;