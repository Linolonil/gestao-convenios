import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface UsuarioFormDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    formData: any;
    setFormData: (v: any) => void;
    onSave: () => void;
    isEditing: boolean;
}

export const UsuarioFormDialog = ({
    open,
    onOpenChange,
    formData,
    setFormData,
    onSave,
    isEditing,
}: UsuarioFormDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Nome completo"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@exemplo.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="senha">Senha</Label>
                        <Input
                            id="senha"
                            type="password"
                            value={formData.senha}
                            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="perfil">Perfil</Label>
                        <Select
                            value={formData.perfil}
                            onValueChange={(value: any) =>
                                setFormData({ ...formData, perfil: value })
                            }
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                <SelectItem value="ANALISTA">Analista</SelectItem>
                                <SelectItem value="ESTAGIARIO">Estagiário</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="ativo">Usuário Ativo</Label>
                        <Switch
                            id="ativo"
                            checked={formData.ativo}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, ativo: checked })
                            }
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={onSave}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
