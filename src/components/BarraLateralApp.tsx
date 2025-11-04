import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Users, 
  FolderOpen, 
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logoCaaam from "@/assets/logo-caaam-sidebar.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

  const isActive = (path: string) => location.pathname === path;

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
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className={`p-4 ${isCollapsed ? 'px-2' : 'px-6'} border-b border-sidebar-border`}>
          <div className="flex items-center gap-3">
            <img 
              src={logoCaaam} 
              alt="Logo OAB Amazonas CAAAM" 
              className={isCollapsed ? "w-10 h-10 object-contain flex-shrink-0" : "w-14 h-14 object-contain flex-shrink-0"}
            />
            {!isCollapsed && (
              <div>
                <h1 className="text-sm font-semibold text-sidebar-primary">CAAAM</h1>
                <p className="text-xs text-sidebar-foreground">Gestão de Convênios</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => item.show).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive 
                            ? 'bg-sidebar-accent text-sidebar-primary font-medium' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
