
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type UserStatusType = 'available' | 'busy' | 'away' | 'focus';

interface UserStatusProps {
  username: string;
  avatarUrl?: string;
  status: UserStatusType;
  statusMessage?: string;
  onStatusChange: (status: UserStatusType) => void;
}

const statusLabels: Record<UserStatusType, string> = {
  available: 'Disponible',
  busy: 'Occupé',
  away: 'Absent',
  focus: 'Concentré'
};

const statusEmojis: Record<UserStatusType, string> = {
  available: '🟢',
  busy: '🔴',
  away: '🟡',
  focus: '🟣'
};

const UserStatus: React.FC<UserStatusProps> = ({
  username,
  avatarUrl,
  status,
  statusMessage,
  onStatusChange
}) => {
  const initials = username
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 p-2">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className={`avatar-indicator avatar-indicator-${status}`} />
      </div>
      
      <div className="flex flex-col">
        <span className="font-medium">{username}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-0 font-normal text-xs text-muted-foreground hover:text-foreground justify-start">
              <span className="mr-1">{statusEmojis[status]}</span>
              {statusLabels[status]}
              {statusMessage && ` - ${statusMessage}`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Changer de statut</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange('available')}>
              <span className="mr-2">🟢</span> Disponible
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange('busy')}>
              <span className="mr-2">🔴</span> Occupé
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange('away')}>
              <span className="mr-2">🟡</span> Absent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange('focus')}>
              <span className="mr-2">🟣</span> Concentré
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default UserStatus;
