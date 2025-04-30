
import React, { useState } from 'react';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import WorkspaceHeader from '@/components/WorkspaceHeader';
import WorkspaceMap from '@/components/WorkspaceMap';
import UserStatus, { UserStatusType } from '@/components/UserStatus';
import { mockWorkspace, currentUser } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatusType>(currentUser.status);
  const { toast } = useToast();

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleToggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const handleStatusChange = (newStatus: UserStatusType) => {
    setUserStatus(newStatus);
    
    const statusMessages = {
      available: 'Vous êtes maintenant disponible',
      busy: 'Vous êtes maintenant occupé',
      away: 'Vous êtes maintenant absent',
      focus: 'Vous êtes maintenant en mode concentration'
    };
    
    toast({
      title: 'Statut mis à jour',
      description: statusMessages[newStatus],
    });
  };

  const handleJoinRoom = (roomId: string) => {
    const room = mockWorkspace.rooms.find(r => r.id === roomId);
    if (room) {
      toast({
        title: `Vous rejoignez "${room.name}"`,
        description: 'Connexion en cours...',
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile unless mobileNavOpen is true */}
      <div className={`
        fixed top-0 bottom-0 left-0 z-50 md:static md:z-0
        transform transition-transform duration-300 ease-in-out
        ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <WorkspaceSidebar 
          isCollapsed={sidebarCollapsed} 
          toggleSidebar={handleToggleSidebar} 
        />
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <WorkspaceHeader 
          workspaceName={mockWorkspace.name}
          toggleMobileNav={handleToggleMobileNav}
        />
        
        <div className="flex flex-col flex-1 overflow-auto">
          <div className="border-b bg-muted/20 p-2">
            <UserStatus
              username={currentUser.username}
              status={userStatus}
              statusMessage={currentUser.statusMessage}
              onStatusChange={handleStatusChange}
            />
          </div>
          
          <WorkspaceMap 
            rooms={mockWorkspace.rooms}
            onJoinRoom={handleJoinRoom}
            currentUserId={currentUser.id}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
