
import { RoomType } from '@/components/RoomCard';
import { UserStatusType } from '@/components/UserStatus';

// Define types for our data structures
export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  status: UserStatusType;
  statusMessage?: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description: string;
  occupants: User[];
  maxCapacity: number;
}

export interface Workspace {
  id: string;
  name: string;
  rooms: Room[];
}

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'Sophie Martin',
    status: 'available',
  },
  {
    id: 'user2',
    username: 'Thomas Bernard',
    status: 'busy',
    statusMessage: 'En réunion',
  },
  {
    id: 'user3',
    username: 'Julie Dubois',
    status: 'focus',
    statusMessage: 'Ne pas déranger',
  },
  {
    id: 'user4',
    username: 'Antoine Lefebvre',
    status: 'away',
  },
  {
    id: 'user5',
    username: 'Claire Moreau',
    status: 'available',
  },
];

// Mock rooms
export const mockRooms: Room[] = [
  {
    id: 'room1',
    name: 'Design Studio',
    type: 'meeting',
    description: 'Espace collaboratif pour les équipes design',
    occupants: [mockUsers[0], mockUsers[1]],
    maxCapacity: 6,
  },
  {
    id: 'room2',
    name: 'Zone de concentration',
    type: 'focus',
    description: 'Espace calme pour travailler sans interruption',
    occupants: [mockUsers[2]],
    maxCapacity: 4,
  },
  {
    id: 'room3',
    name: 'Café virtuel',
    type: 'social',
    description: 'Espace pour les discussions informelles',
    occupants: [mockUsers[3], mockUsers[4]],
    maxCapacity: 10,
  },
  {
    id: 'room4',
    name: 'Salle de brainstorming',
    type: 'meeting',
    description: 'Pour les sessions de créativité en équipe',
    occupants: [],
    maxCapacity: 8,
  },
  {
    id: 'room5',
    name: 'Salle de méditation',
    type: 'break',
    description: 'Espace calme pour se ressourcer',
    occupants: [],
    maxCapacity: 4,
  },
];

// Mock workspace
export const mockWorkspace: Workspace = {
  id: 'workspace1',
  name: 'Nimbo Workspace',
  rooms: mockRooms,
};

export const currentUser: User = {
  id: 'current-user',
  username: 'Moi',
  status: 'available',
};
