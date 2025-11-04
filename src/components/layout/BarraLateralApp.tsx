import logoCaaam from "@/assets/logo-caaam-sidebar.png";
import logoOab from "@/assets/logo-oab.jpg";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  Home,
  Shield,
  Users
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function BarraLateralApp() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isCollapsed = state === "collapsed";

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      show: true,
    },
    {
      title: "Convênios",
      url: "/convenios",
      icon: FileText,
      show: true,
    },
    {
      title: "Parceiros",
      url: "/parceiros",
      icon: Users,
      show: true,
    },
    {
      title: "Documentos",
      url: "/documentos",
      icon: FolderOpen,
      show: true,
    },
    {
      title: "Usuários",
      url: "/usuarios",
      icon: Shield,
      show: isAdmin(),
    },
  ];

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Header com Logo */}
        <div className={`flex items-center h-16 ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-sidebar-border transition-all duration-200`}>
          {isCollapsed ?<img
            src={logoOab}
              alt="Logo OAB Amazonas CAAAM"
              className="w-full h-full object-contain"
          /> : <img
            src={logoCaaam}
            alt="Logo OAB Amazonas CAAAM"
            className="w-full h-full object-contain"
          />}
          {!isCollapsed && (
            <div className="overflow-hidden">
            </div>
          )}
        </div>

        {/* Menu de Navegação */}
        <SidebarGroup className="flex-1 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="h-full">
              {menuItems.filter(item => item.show).map((item) => {
                const isActiveRoute = location.pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`
                          group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                          transition-all duration-200 ease-in-out
                          ${isCollapsed ? 'justify-center' : ''}
                          ${isActiveRoute
                            ? 'bg-sidebar-accent text-sidebar-primary  font-semibold shadow-sm'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary'
                          }
                        `}
                      >
                        {/* Indicador visual de item ativo */}
                        {isActiveRoute && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full" />
                        )}

                        {/* Ícone */}
                        <item.icon className={`
                          flex-shrink-0 transition-all duration-200
                          ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}
                          ${isActiveRoute ? 'scale-110' : 'group-hover:scale-105'}
                        `} />

                        {/* Texto do menu */}
                        {!isCollapsed && (
                          <span className="flex-1 text-sm">{item.title}</span>
                        )}

                        {/* Ícone de seta ao hover (apenas quando expandido e ativo) */}
                        {!isCollapsed && isActiveRoute && (
                          <ChevronRight className="w-4 h-4 opacity-70" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer (opcional - pode adicionar informações do usuário aqui) */}
        <div className={`p-4 border-t border-sidebar-border ${isCollapsed ? 'px-2' : 'px-6'}`}>
          <div className={`text-xs text-sidebar-foreground/50 ${isCollapsed ? 'text-center' : ''}`}>
            {!isCollapsed ? (
              <p>© 2024 OAB-AM</p>
            ) : (
              <p className="font-mono">©</p>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}