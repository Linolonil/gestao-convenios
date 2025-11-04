import { FormularioParceiro } from "@/components/parceiros/FormularioParceiro";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function DialogEditarParceiro({ open, onOpenChange, parceiro, onUpdate, loading }) {
    if (!parceiro) return null;

    const defaultValues = {
        nome: parceiro.nome,
        cpf_cnpj: parceiro.cpf_cnpj,
        area_atuacao: parceiro.area_atuacao || "",
        email: parceiro.email || "",
        telefone: parceiro.telefone || "",
        logradouro: parceiro.endereco_completo?.logradouro || "",
        numero: parceiro.endereco_completo?.numero || "",
        complemento: parceiro.endereco_completo?.complemento || "",
        bairro: parceiro.endereco_completo?.bairro || "",
        cidade: parceiro.endereco_completo?.cidade || "",
        estado: parceiro.endereco_completo?.estado || "",
        cep: parceiro.endereco_completo?.cep || "",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Parceiro</DialogTitle>
                </DialogHeader>
                <FormularioParceiro
                    defaultValues={defaultValues}
                    submitLabel="Salvar alterações"
                    onSubmit={(values) => onUpdate(parceiro.id, values)}
                    loading={loading}
                />
            </DialogContent>
        </Dialog>
    );
}
