
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Calendar, 
  User, 
  Users, 
  Settings,
  MessageCircle
} from "lucide-react";

interface WorkspaceSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({ 
  isCollapsed,
  toggleSidebar
}) => {
  return (
    <div
      className={`h-screen bg-sidebar transition-all duration-300 border-r ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="font-semibold text-primary text-xl">Nimbo</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleSidebar}
          >
            {isCollapsed ? "→" : "←"}
          </Button>
        </div>

        <nav className="flex-1 pt-4">
          <ul className="space-y-2 px-2">
            <SidebarItem icon={<Home />} label="Accueil" href="#" isCollapsed={isCollapsed} />
            <li className="pt-4 pb-2">
              {!isCollapsed && (
                <span className="text-xs font-semibold text-muted-foreground uppercase px-2">
                  Salles
                </span>
              )}
            </li>
            <SidebarItem 
              icon={<Users />} 
              label="Espace ouvert" 
              href="#" 
              count={4} 
              isCollapsed={isCollapsed} 
            />
            <SidebarItem 
              icon={<MessageCircle />} 
              label="Salle de réunion" 
              href="#" 
              count={2} 
              isCollapsed={isCollapsed} 
            />
            <SidebarItem 
              icon={<User />} 
              label="Salle focus" 
              href="#" 
              count={1} 
              isCollapsed={isCollapsed} 
            />
            <li className="pt-4 pb-2">
              {!isCollapsed && (
                <span className="text-xs font-semibold text-muted-foreground uppercase px-2">
                  Agenda
                </span>
              )}
            </li>
            <SidebarItem icon={<Calendar />} label="Événements" href="#" isCollapsed={isCollapsed} />
          </ul>
        </nav>

        <div className="p-4 border-t">
          <SidebarItem icon={<Settings />} label="Paramètres" href="#" isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  count?: number;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  href, 
  count, 
  isCollapsed 
}) => {
  return (
    <li>
      <a
        href={href}
        className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
      >
        <span className="mr-3 h-5 w-5">{icon}</span>
        {!isCollapsed && (
          <>
            <span className="flex-1">{label}</span>
            {count !== undefined && (
              <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-primary bg-primary-foreground rounded-full">
                {count}
              </span>
            )}
          </>
        )}
      </a>
    </li>
  );
};

export default WorkspaceSidebar;
