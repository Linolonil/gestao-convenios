import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function DialogVisualizarParceiro({ open, onOpenChange, parceiro }) {
    if (!parceiro) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalhes do Parceiro</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">{parceiro.nome}</h3>
                            {parceiro.categorias?.length > 0 && (
                                <p className="text-muted-foreground">
                                    Segmento: {parceiro.categorias.join(", ")}
                                </p>
                            )}
                        </div>
                        {parceiro.ativo ? (
                            <Badge>ATIVO</Badge>
                        ) : (
                            <Badge variant="destructive">INATIVO</Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">CPF/CNPJ</label>
                            <p className="text-sm">{parceiro.cpf_cnpj}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                            <p className="text-sm">
                                {parceiro.tipo_pessoa === "juridica" ? "Pessoa Jurídica" : "Pessoa Física"}
                            </p>
                        </div>
                        {parceiro.tipo_pessoa === "juridica" && parceiro.responsavel && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Responsável</label>
                                <p className="text-sm">{parceiro.responsavel}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-sm">{parceiro.email || "Não informado"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                            <p className="text-sm">{parceiro.telefone || "Não informado"}</p>
                        </div>

                        {parceiro.endereco_completo && (
                            <>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                                    <p className="text-sm">
                                        {parceiro.endereco_completo.logradouro}
                                        {parceiro.endereco_completo.numero && `, ${parceiro.endereco_completo.numero}`}
                                        {parceiro.endereco_completo.complemento && ` - ${parceiro.endereco_completo.complemento}`}
                                    </p>
                                </div>
                                {parceiro.endereco_completo.bairro && (
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                                        <p className="text-sm">{parceiro.endereco_completo.bairro}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {parceiro.observacoes && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Observações</label>
                            <p className="text-sm mt-1">{parceiro.observacoes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
