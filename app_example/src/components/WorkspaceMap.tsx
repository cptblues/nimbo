
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoomType } from './RoomCard';
import { UserStatusType } from './UserStatus';
import { DoorOpen, DoorClosed } from 'lucide-react';

// Types pour les données
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

interface WorkspaceMapProps {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
  currentUserId: string;
}

// Définitions des positions des salles sur la carte
const roomPositions: Record<string, { x: number; y: number; width: number; height: number }> = {
  // On positionne les salles selon leur type
  room1: { x: 50, y: 50, width: 200, height: 150 },   // meeting
  room2: { x: 300, y: 50, width: 150, height: 150 },  // focus
  room3: { x: 50, y: 250, width: 200, height: 120 },  // social
  room4: { x: 300, y: 250, width: 150, height: 120 }, // meeting
  room5: { x: 500, y: 150, width: 120, height: 120 }, // break
};

// Couleurs par type de salle
const roomColors: Record<RoomType, string> = {
  meeting: 'bg-blue-100 border-blue-300',
  focus: 'bg-purple-100 border-purple-300',
  social: 'bg-amber-100 border-amber-300',
  break: 'bg-green-100 border-green-300'
};

// Libellés pour les types de salles
const typeLabels: Record<RoomType, string> = {
  focus: 'Focus',
  meeting: 'Réunion',
  social: 'Social',
  break: 'Pause'
};

const WorkspaceMap: React.FC<WorkspaceMapProps> = ({ rooms, onJoinRoom, currentUserId }) => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [avatarPosition, setAvatarPosition] = useState({ x: 250, y: 180 });
  const [isMoving, setIsMoving] = useState(false);

  // Trouve la salle où se trouve l'utilisateur actuel
  const findUserRoom = () => {
    return rooms.find(room => room.occupants.some(user => user.id === currentUserId))?.id || null;
  };

  // Gestion du clic sur une salle
  const handleRoomClick = (roomId: string) => {
    if (isMoving) return; // Éviter les clics multiples pendant le mouvement
    
    const targetRoom = rooms.find(room => room.id === roomId);
    if (!targetRoom) return;
    
    const position = roomPositions[roomId];
    if (!position) return;
    
    // Calculer une position à l'intérieur de la salle pour l'avatar
    const targetX = position.x + position.width / 2;
    const targetY = position.y + position.height / 2;
    
    // Animation de déplacement de l'avatar
    setIsMoving(true);
    setCurrentRoom(roomId);
    
    // Animer vers la nouvelle position
    setAvatarPosition({ x: targetX, y: targetY });
    
    // Après l'animation, rejoindre la salle
    setTimeout(() => {
      onJoinRoom(roomId);
      setIsMoving(false);
    }, 1000); // Durée correspondant à l'animation
  };

  return (
    <div className="p-4 md:p-6 relative">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Carte de l'espace</h2>
        <p className="text-sm text-muted-foreground">Cliquez sur une salle pour la rejoindre</p>
      </div>
      
      {/* Zone de carte avec les salles */}
      <div className="relative bg-muted/30 border rounded-lg shadow-sm h-[500px] overflow-hidden">
        {/* Lignes de connexion entre les salles */}
        <svg className="absolute top-0 left-0 w-full h-full">
          {/* Connexions entre les salles */}
          <line x1="150" y1="125" x2="300" y2="125" stroke="#d1d5db" strokeWidth="4" strokeDasharray="5,5" />
          <line x1="150" y1="250" x2="150" y2="125" stroke="#d1d5db" strokeWidth="4" strokeDasharray="5,5" />
          <line x1="375" y1="125" x2="500" y2="175" stroke="#d1d5db" strokeWidth="4" strokeDasharray="5,5" />
          <line x1="375" y1="250" x2="375" y2="125" stroke="#d1d5db" strokeWidth="4" strokeDasharray="5,5" />
          <line x1="250" y1="250" x2="300" y2="250" stroke="#d1d5db" strokeWidth="4" strokeDasharray="5,5" />
        </svg>
        
        {/* Rendu des salles */}
        {rooms.map(room => {
          const position = roomPositions[room.id];
          if (!position) return null;
          
          const isCurrentRoom = room.id === currentRoom;
          
          return (
            <motion.div
              key={room.id}
              className={`absolute border-2 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${roomColors[room.type]} ${isCurrentRoom ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              style={{
                top: position.y,
                left: position.x,
                width: position.width,
                height: position.height
              }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleRoomClick(room.id)}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">{room.name}</h3>
                  <span className="text-xs bg-white/70 px-1.5 py-0.5 rounded-full">
                    {typeLabels[room.type]}
                  </span>
                </div>
                
                {/* Description de la salle */}
                <p className="text-xs text-muted-foreground mt-1">{room.description}</p>
                
                {/* Occupants de la salle */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {room.occupants.length}/{room.maxCapacity}
                    </div>
                    {isCurrentRoom ? 
                      <DoorOpen className="h-4 w-4 text-primary" /> : 
                      <DoorClosed className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  
                  {room.occupants.length > 0 && (
                    <div className="flex -space-x-2 overflow-hidden mt-1">
                      {room.occupants.map(user => (
                        <div key={user.id} className="relative inline-block">
                          <Avatar className="h-6 w-6 border-2 border-background">
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
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* Avatar de l'utilisateur actuel */}
        <motion.div
          className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            x: avatarPosition.x,
            y: avatarPosition.y
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
        >
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-primary ring-offset-1 ring-offset-background">
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <motion.div 
              className="absolute -bottom-1 -right-1 h-3 w-3 bg-primary rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: isMoving ? [1, 0.7, 1] : 1
              }}
              transition={{ 
                repeat: isMoving ? Infinity : 0, 
                duration: 1.5 
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Légende des types de salles */}
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${roomColors[type as RoomType].split(' ')[0]}`} />
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceMap;
