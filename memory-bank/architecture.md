# Architecture - Espace de Coworking Virtuel Nimbo

Ce document décrit l'architecture technique et le schéma de données de l'application Nimbo. Il doit être consulté avant de commencer le développement de toute nouvelle fonctionnalité.

## Structure des dossiers du projet

**Important** : Le code source de l'application se trouve dans le dossier `nimbo-app/` à la racine du dépôt. Toutes les commandes (npm, next, etc.) doivent être exécutées à partir de ce dossier.

```
/nimbo/                  # Racine du dépôt
├── nimbo-app/           # Code source de l'application (dossier de travail principal)
│   ├── src/             # Code source
│   ├── public/          # Fichiers statiques
│   └── ...              # Fichiers de configuration
├── memory-bank/         # Documentation du projet
└── app_example/         # Exemples et références
```

## Architecture globale

L'application est construite selon une architecture moderne utilisant Next.js 15 avec App Router, et Supabase comme backend as a service.

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│   Frontend     │◄───►│   Supabase     │◄───►│   Jitsi Meet   │
│   (Next.js 15) │     │                │     │   (externe)    │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
```

### Fonctionnalités de Next.js 15

La migration vers Next.js 15 apporte plusieurs améliorations importantes:

- **Partial Prerendering (PPR)**: Permet un chargement initial ultra-rapide grâce au rendu statique, tout en conservant des parties dynamiques
- **API Cookies asynchrone**: Les fonctions `cookies()` sont désormais asynchrones pour de meilleures performances
- **Optimisations d'images**: Support amélioré pour les formats modernes (WebP, AVIF)
- **Headers de sécurité**: Configuration intégrée pour les headers de sécurité
- **Stabilité de l'App Router**: Nombreuses corrections et améliorations de l'App Router

**Note**: Next.js 15 requiert Node.js 18.18.0 ou supérieur.

## Structure du projet

```
src/
├── app/             # Routes Next.js App Router
│   ├── api/         # Routes API
│   │   ├── rooms/             # API pour les salles
│   │   │   └── [id]/          # Opérations sur une salle spécifique
│   │   │       ├── messages/   # Gestion des messages
│   │   │       └── participants/ # Gestion des participants
│   │   ├── users/             # API pour les utilisateurs
│   │   │   ├── me/            # Profil utilisateur
│   │   │   └── search/        # Recherche d'utilisateurs
│   │   └── workspaces/        # API pour les workspaces
│   │       └── [id]/          # Opérations sur un workspace spécifique
│   │           ├── members/    # Gestion des membres
│   │           └── rooms/      # Gestion des salles du workspace
│   ├── auth/        # Pages d'authentification
│   ├── dashboard/   # Interface principale
│   ├── profile/     # Profil utilisateur
│   └── workspaces/  # Gestion des workspaces
├── components/      # Composants réutilisables
│   ├── layout/      # Composants de mise en page
│   │   ├── Header.tsx      # Barre de navigation supérieure
│   │   └── Sidebar.tsx     # Barre latérale de navigation
│   └── ui/          # Composants shadcn/ui
├── hooks/           # Hooks personnalisés
│   ├── useRealtime.ts       # Hook générique pour Supabase Realtime
│   ├── useRealtimeStatus.ts # Gestion de la connexion temps réel
│   ├── usePresence.ts       # Gestion de la présence utilisateur
│   ├── useRoomPresence.ts   # Présence dans les salles
│   └── useWorkspacePresence.ts # Présence dans les workspaces
├── lib/             # Utilitaires et configurations
├── store/           # Stores Zustand
│   ├── userStore.ts        # Gestion d'état des utilisateurs
│   ├── workspaceStore.ts   # Gestion d'état des workspaces
│   └── roomStore.ts        # Gestion d'état des salles et messages
├── types/           # Définitions TypeScript
│   └── declarations.d.ts   # Extensions de types pour Supabase
└── utils/           # Fonctions utilitaires
    └── supabase/    # Utilitaires Supabase
        ├── client.ts   # Client Supabase côté navigateur
        └── server.ts   # Client Supabase côté serveur
```

## Architecture API

L'application utilise des API RESTful implémentées via les Route Handlers de Next.js. Toutes les API suivent une structure commune :

```
api/
├── [ressource]/               # Collection de ressources
│   ├── route.ts               # GET (liste), POST (création)
│   └── [id]/                  # Ressource spécifique
│       ├── route.ts           # GET (détail), PUT (mise à jour), DELETE
│       └── [sous-ressource]/  # Sous-ressource liée
│           └── route.ts       # Opérations sur la sous-ressource
```

### Format de réponse standard

Toutes les API renvoient un format de réponse JSON standardisé :

```typescript
// Réponse réussie
{
  success: true,
  data: {
    // Données de réponse
  }
}

// Réponse d'erreur
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Description de l'erreur",
    details: { /* Détails optionnels */ }
  }
}
```

### Validation des données

Les API utilisent la bibliothèque zod pour valider les données entrantes :

```typescript
import { z } from 'zod';

// Schéma de validation
const createWorkspaceSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional(),
  logo_url: z.string().url().optional()
});

// Validation dans le route handler
const { data, success } = createWorkspaceSchema.safeParse(await req.json());
if (!success) {
  return NextResponse.json({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Données invalides",
      details: data.error
    }
  }, { status: 400 });
}
```

### Principales API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/users` | GET | Liste des utilisateurs |
| `/api/users/me` | GET, PUT | Profil utilisateur |
| `/api/users/me/status` | PUT | Mise à jour du statut |
| `/api/users/search` | GET | Recherche d'utilisateurs |
| `/api/workspaces` | GET, POST | Liste et création de workspaces |
| `/api/workspaces/[id]` | GET, PUT, DELETE | Opérations sur un workspace |
| `/api/workspaces/[id]/members` | GET, POST | Liste et ajout de membres |
| `/api/workspaces/[id]/members/[userId]` | GET, PUT, DELETE | Opérations sur un membre |
| `/api/workspaces/[id]/rooms` | GET, POST | Liste et création de salles |
| `/api/workspaces/[id]/rooms/[roomId]` | GET, PUT, DELETE | Opérations sur une salle |
| `/api/rooms/[id]/participants` | GET, POST | Liste et ajout de participants |
| `/api/rooms/[id]/participants/[userId]` | PUT, DELETE | Mise à jour et retrait d'un participant |
| `/api/rooms/[id]/messages` | GET, POST | Liste et envoi de messages |
| `/api/rooms/[id]/messages/[messageId]` | DELETE | Suppression d'un message |

### API des statuts utilisateur

Pour gérer l'état en ligne/hors ligne des utilisateurs, nous avons une API dédiée :

```
/api/users/me/status
```

Cette API attend un objet JSON avec les propriétés `status` et `status_message` :

```json
{
  "status": "online|away|busy|offline",
  "status_message": "Message personnalisé"
}
```

## Architecture temps réel

L'application utilise Supabase Realtime pour gérer les mises à jour en temps réel et la synchronisation des données entre les clients.

### Canaux temps réel

Chaque entité principale dispose d'un canal dédié :

| Entité | Format du canal | Description |
|--------|----------------|-------------|
| Workspace | `workspace:${workspaceId}` | Mises à jour du workspace et ses membres |
| Room | `room:${roomId}` | Événements dans une salle spécifique |
| Presence | `presence:${entityId}` | État de présence des utilisateurs |

### Hooks de gestion temps réel

Une architecture modulaire a été mise en place pour gérer les connexions temps réel :

```
┌────────────────┐
│ useRealtime    │ ← Hook générique pour les abonnements Realtime
└───────┬────────┘
        │
        ▼
┌────────────────┐
│useRealtimeStatus│ ← Gestion de l'état de connexion et reconnexion
└───────┬────────┘
        │
        ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  usePresence   │     │useRoomPresence │     │useWorkspace    │
│                │ ←── │                │ ←── │Presence        │
└────────────────┘     └────────────────┘     └────────────────┘
```

#### useRealtimeStatus

Ce hook gère l'état de la connexion Realtime et la reconnexion automatique en cas de perte de connexion.

```typescript
const { 
  status,      // CONNECTING, CONNECTED, DISCONNECTED, RECONNECTING
  connected,   // true si connecté
  error,       // message d'erreur
  reset,       // fonction pour réinitialiser la connexion
  channel      // référence au canal Supabase
} = useRealtimeStatus('my-channel');
```

#### useRealtime

Hook générique pour s'abonner aux changements de tables dans Supabase.

```typescript
const {
  status,          // État de la connexion
  isListening,     // true si les abonnements sont actifs
  error,           // message d'erreur
  startListening,  // fonction pour démarrer l'écoute
  stopListening,   // fonction pour arrêter l'écoute
  reset            // fonction pour réinitialiser la connexion
} = useRealtime('my-channel', {
  table: 'rooms',
  onInsert: (newRoom) => { /* ... */ },
  onUpdate: (newRoom, oldRoom) => { /* ... */ },
  onDelete: (oldRoom) => { /* ... */ }
});
```

#### usePresence

Hook pour gérer la présence des utilisateurs (online, busy, away, offline).

```typescript
const {
  presenceUsers,   // Liste des utilisateurs avec leur statut
  updateStatus,    // Fonction pour mettre à jour son propre statut
  error            // message d'erreur
} = usePresence('channel-name', [userId1, userId2, ...]);
```

### État global avec Zustand

Le `roomStore` gère l'état des salles, participants et messages en temps réel.

```typescript
const {
  // État
  rooms, currentRoom, participants, messages,
  
  // Actions pour les salles
  fetchRooms, fetchRoomDetails, joinRoom, leaveRoom,
  
  // Actions pour les messages
  sendMessage,
  
  // Actions pour les médias
  toggleAudio, toggleVideo
} = useRoomStore();
```

### Extensions de types TypeScript

Pour assurer un typage correct avec l'API Realtime de Supabase, nous avons étendu les types natifs dans `src/types/declarations.d.ts` :

```typescript
declare module '@supabase/supabase-js' {
  export interface RealtimePostgresChangesPayload<T> {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T;
    old: T;
    // autres propriétés...
  }
  
  // Autres interfaces...
  
  interface RealtimeChannel {
    on(
      event: 'postgres_changes',
      schema: { event: string; schema: string; table: string; filter?: any },
      callback: (payload: RealtimePostgresChangesPayload<any>) => void
    ): RealtimeChannel;
    
    // Autres méthodes...
  }
}
```

## Schéma de la base de données

### Table: users
Extension de la table auth.users de Supabase.

| Colonne          | Type          | Description                           |
|------------------|---------------|---------------------------------------|
| id               | uuid          | Clé primaire, généré par auth         |
| email            | text          | Email de l'utilisateur                |
| display_name     | text          | Nom affiché                           |
| avatar_url       | text          | URL de l'avatar                       |
| status           | text          | Status actuel (online, busy, away)    |
| status_message   | text          | Message de statut personnalisé        |
| created_at       | timestamptz   | Date de création                      |
| updated_at       | timestamptz   | Dernière mise à jour                  |

### Table: workspaces
Espaces de coworking virtuels.

| Colonne          | Type          | Description                           |
|------------------|---------------|---------------------------------------|
| id               | uuid          | Clé primaire                          |
| name             | text          | Nom du workspace                      |
| description      | text          | Description                           |
| owner_id         | uuid          | ID du créateur (ref users.id)         |
| logo_url         | text          | URL du logo                           |
| created_at       | timestamptz   | Date de création                      |
| updated_at       | timestamptz   | Dernière mise à jour                  |

### Table: workspace_members
Association des utilisateurs aux workspaces.

| Colonne          | Type          | Description                           |
|------------------|---------------|---------------------------------------|
| id               | uuid          | Clé primaire                          |
| workspace_id     | uuid          | Référence vers workspaces.id          |
| user_id          | uuid          | Référence vers users.id               |
| role             | text          | Rôle (admin, member)                  |
| created_at       | timestamptz   | Date d'ajout                          |
| updated_at       | timestamptz   | Dernière mise à jour                  |

### Table: rooms
Salles virtuelles à l'intérieur des workspaces.

| Colonne          | Type          | Description                           |
|------------------|---------------|---------------------------------------|
| id               | uuid          | Clé primaire                          |
| workspace_id     | uuid          | Référence vers workspaces.id          |
| name             | text          | Nom de la salle                       |
| description      | text          | Description                           |
| type             | text          | Type (meeting, lounge, focus, etc.)   |
| capacity         | integer       | Capacité maximale (optionnel)         |
| created_at       | timestamptz   | Date de création                      |
| updated_at       | timestamptz   | Dernière mise à jour                  |

### Table: room_participants
Utilisateurs actuellement présents dans une salle.

| Colonne          | Type          | Description                           |
|------------------|---------------|---------------------------------------|
| id               | uuid          | Clé primaire                          |
| room_id          | uuid          | Référence vers rooms.id               |
| user_id          | uuid          | Référence vers users.id               |
| joined_at        | timestamptz   | Date/heure d'entrée                   |
| video_enabled    | boolean       | État de la vidéo                      |
| audio_enabled    | boolean       | État du micro                         |

### Table: chat_messages
Messages dans le chat d'une salle.

| Colonne          | Type          | Description                           |
|------------------|---------------|---------------------------------------|
| id               | uuid          | Clé primaire                          |
| room_id          | uuid          | Référence vers rooms.id               |
| user_id          | uuid          | Référence vers users.id               |
| content          | text          | Contenu du message                    |
| created_at       | timestamptz   | Date d'envoi                          |
| updated_at       | timestamptz   | Dernière mise à jour                  |

## Sécurité et politiques RLS

Politiques Row Level Security (RLS) appliquées dans Supabase:

1. **users**: 
   - Lecture: tous les utilisateurs authentifiés peuvent voir les profils de base
   - Écriture: un utilisateur ne peut modifier que son propre profil

2. **workspaces**:
   - Lecture: membres du workspace uniquement
   - Écriture: admins du workspace uniquement
   - Création: tous les utilisateurs authentifiés

3. **rooms**:
   - Lecture: membres du workspace parent
   - Écriture: admins du workspace parent
   - Création: admins du workspace parent

4. **room_participants**:
   - Lecture: membres du workspace parent
   - Écriture: l'utilisateur concerné (son propre statut)

5. **chat_messages**:
   - Lecture: membres de la salle
   - Écriture: membres de la salle (leur propre message)
   - Suppression: auteur du message ou admin

## Gestion d'état avec Zustand

L'application utilise Zustand pour la gestion d'état côté client, avec une architecture de stores modulaires :

### userStore

Gère l'état de l'utilisateur connecté, avec persistance via sessionStorage.

```typescript
interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserProfile: (profile: Partial<User>) => void;
  updateUserStatus: (status: string, statusMessage?: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}
```

### workspaceStore

Gère les workspaces de l'utilisateur et les opérations associées.

```typescript
interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, data: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  members: WorkspaceMember[];
  setMembers: (members: WorkspaceMember[]) => void;
  addMember: (member: WorkspaceMember) => void;
  updateMember: (userId: string, data: Partial<WorkspaceMember>) => void;
  removeMember: (userId: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}
```

### roomStore

Gère les salles, les participants et les messages en temps réel.

```typescript
interface RoomState {
  // État des salles
  rooms: Room[];
  currentRoom: Room | null;
  participants: RoomParticipant[];
  messages: Message[];
  
  // État de chargement et erreurs
  isLoadingRooms: boolean;
  isLoadingParticipants: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  
  // Canaux de temps réel
  roomsChannel: RealtimeChannel | null;
  participantsChannel: RealtimeChannel | null;
  messagesChannel: RealtimeChannel | null;
  
  // Actions pour les salles, participants et messages
  setRooms: (rooms: Room[]) => void;
  setCurrentRoom: (room: Room | null) => void;
  // ... autres actions ...
  
  // Gestion des canaux en temps réel
  subscribeToRooms: (workspaceId: string) => void;
  subscribeToRoom: (roomId: string) => void;
  unsubscribeFromRooms: () => void;
  unsubscribeFromRoom: () => void;
  
  // Actions complexes
  fetchRooms: (workspaceId: string) => Promise<void>;
  fetchRoomDetails: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: () => Promise<boolean>;
  sendMessage: (content: string) => Promise<boolean>;
  toggleAudio: (enabled: boolean) => Promise<boolean>;
  toggleVideo: (enabled: boolean) => Promise<boolean>;
}
```

## Hooks temps réel

L'application utilise plusieurs hooks personnalisés pour gérer les fonctionnalités en temps réel :

### useRealtimeStatus

Hook de base pour gérer la connexion aux canaux Supabase Realtime et les reconnexions automatiques.

```typescript
function useRealtimeStatus(
  channelName: string,
  options?: {
    onReconnect?: () => void;
    maxRetries?: number;
    retryInterval?: number;
  }
): {
  status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  error: string | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => void;
  reset: () => void;
  channel: RealtimeChannel | null;
}
```

### useRealtime

Hook générique pour s'abonner aux changements Postgres via Supabase Realtime.

```typescript
function useRealtime<T extends Record<string, any>>(
  channelName: string,
  options: {
    table: string;
    schema?: string;
    filter?: string;
    onInsert?: (record: T) => void;
    onUpdate?: (newRecord: T, oldRecord: T) => void;
    onDelete?: (oldRecord: T) => void;
    onAll?: (payload: RealtimePostgresChangesPayload<T>) => void;
  }
): {
  status: string;
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}
```

### usePresence

Hook pour suivre la présence des utilisateurs dans un contexte donné.

```typescript
function usePresence(
  channelName: string, 
  userIds?: string[]
): {
  presenceUsers: Array<{
    id: string;
    status: 'online' | 'away' | 'busy' | 'offline';
    lastSeen: string;
  }>;
  updateStatus: (status: 'online' | 'away' | 'busy' | 'offline') => Promise<void>;
  error: string | null;
}
```

### useRoomPresence

Hook spécialisé pour gérer la présence dans une salle spécifique.

```typescript
function useRoomPresence(
  roomId: string
): {
  participants: RoomParticipant[];
  isLoading: boolean;
  error: string | null;
  joinRoom: () => Promise<boolean>;
  leaveRoom: () => Promise<boolean>;
  toggleAudio: (enabled: boolean) => Promise<boolean>;
  toggleVideo: (enabled: boolean) => Promise<boolean>;
}
```

### useWorkspacePresence

Hook pour suivre tous les utilisateurs actifs dans un workspace.

```typescript
function useWorkspacePresence(
  workspaceId: string
): {
  users: Array<{
    id: string;
    display_name: string;
    avatar_url?: string;
    status: string;
    status_message?: string;
    current_room?: {
      id: string;
      name: string;
    };
  }>;
  isLoading: boolean;
  error: string | null;
}
```

## Flux d'authentification

1. L'utilisateur se connecte via OAuth Google
2. Redirection vers la page d'accueil post-authentification
3. Chargement des workspaces de l'utilisateur
4. Sélection d'un workspace pour y accéder

## Flux principal - Rejoindre une salle

1. L'utilisateur navigue vers un workspace
2. Visualisation des salles disponibles avec les participants présents
3. L'utilisateur clique sur une salle pour la rejoindre
4. Mise à jour de la table room_participants
5. Connexion automatique à la session Jitsi correspondante
6. Actualisation en temps réel via Supabase Realtime

## Fichiers de configuration

### Racine du projet

| Fichier | Description |
|---------|-------------|
| `next.config.js` | Configuration de Next.js |
| `.eslintrc.json` | Configuration ESLint avec intégration Prettier |
| `.prettierrc` | Règles de formatage du code (tabWidth: 2, singleQuote: true, etc.) |
| `.prettierignore` | Fichiers ignorés par Prettier |
| `commitlint.config.js` | Règles pour les messages de commit conventionnels |
| `package.json` | Dépendances et scripts npm |
| `tsconfig.json` | Configuration TypeScript |
| `.nvmrc` | Spécifie la version de Node.js requise (18.17.0) |
| `components.json` | Configuration de shadcn/ui |

### Hooks Git (Husky)

| Fichier | Description |
|---------|-------------|
| `.husky/pre-commit` | Exécute lint-staged avant chaque commit |
| `.husky/commit-msg` | Vérifie le format des messages de commit |

## Authentification

L'authentification est gérée par Supabase Auth et configurée pour fonctionner avec Next.js App Router. Voici comment fonctionne le système :

1. Le middleware intercepte les requêtes pour rafraîchir les sessions d'authentification et maintenir l'état de connexion.
2. Les clients Supabase sont initialisés différemment selon le contexte :
   - Client-side : Utilise `createBrowserClient` pour les composants côté client
   - Server-side : Utilise `createServerClient` pour les composants serveur et les route handlers
3. L'authentification utilise les cookies pour stocker les tokens de session.
4. Les routes protégées vérifient l'authentification côté serveur avec `getUser()`.

### Flux d'authentification

1. L'utilisateur s'inscrit via la page `/auth/login`
2. Un email de confirmation est envoyé à l'utilisateur
3. L'utilisateur clique sur le lien qui le redirige vers `/auth/confirm` avec un token
4. La route `/auth/confirm` vérifie le token et crée une session
5. L'utilisateur est redirigé vers la page d'accueil
6. L'utilisateur peut accéder à son profil via `/profile` et se déconnecter

### Variables d'environnement

Pour l'intégration avec Supabase, les variables d'environnement suivantes sont nécessaires :

```
NEXT_PUBLIC_SUPABASE_URL=      # URL du projet Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Clé anon du projet Supabase
```

## Interface utilisateur

L'interface est construite avec TailwindCSS et shadcn/ui:

- **TailwindCSS**: Utility-first CSS framework configuré avec support des thèmes clair/sombre
- **shadcn/ui**: Collection de composants réutilisables basés sur Radix UI et stylés avec Tailwind

Les principaux composants UI inclus actuellement sont:
- Button: Boutons avec différentes variantes (default, outline, ghost, etc.)
- Card: Conteneurs structurés avec header, content et footer

L'application utilise les polices:
- Inter pour le texte standard
- Roboto Mono pour le texte à espacement fixe

---