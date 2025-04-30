
import React from 'react';
import RoomCard, { RoomType } from './RoomCard';
import { UserStatusType } from './UserStatus';

// Define types for our sample data
interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  status: UserStatusType;
}

interface Room {
  id: string;
  name: string;
  type: RoomType;
  description: string;
  occupants: User[];
  maxCapacity: number;
}

interface WorkspaceGridProps {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
}

const WorkspaceGrid: React.FC<WorkspaceGridProps> = ({ rooms, onJoinRoom }) => {
  // Group rooms by type for better organization
  const roomsByType: Record<RoomType, Room[]> = {
    meeting: rooms.filter(room => room.type === 'meeting'),
    focus: rooms.filter(room => room.type === 'focus'),
    social: rooms.filter(room => room.type === 'social'),
    break: rooms.filter(room => room.type === 'break')
  };

  return (
    <div className="p-4 md:p-6">
      {/* Render each room type section if it has rooms */}
      {(Object.keys(roomsByType) as RoomType[]).map(type => {
        const typeRooms = roomsByType[type];
        if (typeRooms.length === 0) return null;

        return (
          <div key={type} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {type === 'focus' && 'Salles de concentration'}
              {type === 'meeting' && 'Salles de réunion'}
              {type === 'social' && 'Espaces sociaux'}
              {type === 'break' && 'Espaces détente'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeRooms.map(room => (
                <RoomCard
                  key={room.id}
                  id={room.id}
                  name={room.name}
                  type={room.type}
                  description={room.description}
                  occupants={room.occupants}
                  maxCapacity={room.maxCapacity}
                  onJoin={onJoinRoom}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkspaceGrid;
