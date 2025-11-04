import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Usuario } from "@/hooks/useUsuarios";
import { Edit, GraduationCap, Shield, Trash2, User } from "lucide-react";

interface UsuarioCardProps {
    usuario: Usuario;
    onEdit: (u: Usuario) => void;
    onDelete: (u: Usuario) => void;
}

export const UsuarioCard = ({ usuario, onEdit, onDelete }: UsuarioCardProps) => {
    const getPerfilIcon = (perfil: string) => {
        switch (perfil) {
            case "ADMIN":
                return <Shield className="w-4 h-4" />;
            case "ANALISTA":
                return <User className="w-4 h-4" />;
            default:
                return <GraduationCap className="w-4 h-4" />;
        }
    };

    const getPerfilVariant = (perfil: string) => {
        switch (perfil) {
            case "ADMIN":
                return "destructive";
            case "ANALISTA":
                return "default";
            case "ESTAGIARIO":
                return "secondary";
            default:
                return "outline";
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getPerfilIcon(usuario.perfil)}
                    {usuario.nome}
                </CardTitle>
                <Badge variant={getPerfilVariant(usuario.perfil)}>
                    {usuario.perfil}
                </Badge>
            </CardHeader>

            <CardContent>
                <div className="text-sm space-y-1 mb-4">
                    <p className="text-muted-foreground">{usuario.email}</p>
                    <Badge variant={usuario.ativo ? "default" : "secondary"}>
                        {usuario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(usuario)}
                        className="flex-1"
                    >
                        <Edit className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(usuario)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
