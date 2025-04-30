
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserStatusType } from './UserStatus';

export type RoomType = 'focus' | 'meeting' | 'social' | 'break';

interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  status: UserStatusType;
}

interface RoomCardProps {
  id: string;
  name: string;
  type: RoomType;
  description: string;
  occupants: User[];
  maxCapacity: number;
  onJoin: (roomId: string) => void;
}

const typeLabels: Record<RoomType, string> = {
  focus: 'Focus',
  meeting: 'Réunion',
  social: 'Social',
  break: 'Pause'
};

const RoomCard: React.FC<RoomCardProps> = ({
  id,
  name,
  type,
  description,
  occupants,
  maxCapacity,
  onJoin
}) => {
  return (
    <Card className={`room-card room-card-${type} animate-fade-in`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          <Badge variant="secondary">{typeLabels[type]}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <span>
            {occupants.length}/{maxCapacity} personnes
          </span>
        </div>
        
        {occupants.length > 0 && (
          <div className="flex -space-x-2 overflow-hidden my-2">
            {occupants.map(user => (
              <div key={user.id} className="relative inline-block">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={`avatar-indicator avatar-indicator-${user.status}`} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => onJoin(id)}
        >
          Rejoindre
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
