# Architecture - Espace de Coworking Virtuel Nimbo

Ce document décrit l'architecture technique et le schéma de données de l'application Nimbo. Il doit être consulté avant de commencer le développement de toute nouvelle fonctionnalité.

## Architecture globale

L'application est construite selon une architecture moderne utilisant Next.js 14+ avec App Router, et Supabase comme backend as a service.

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│   Frontend     │◄───►│   Supabase     │◄───►│   Jitsi Meet   │
│   (Next.js)    │     │                │     │   (externe)    │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
```

## Structure du projet

```
src/
├── app/             # Routes Next.js App Router
│   ├── api/         # Routes API
│   ├── auth/        # Pages d'authentification
│   ├── dashboard/   # Interface principale
│   └── rooms/       # Gestion des salles virtuelles
├── components/      # Composants réutilisables
│   ├── ui/          # Composants shadcn/ui
│   ├── rooms/       # Composants liés aux salles
│   ├── video/       # Composants liés à Jitsi
│   └── shared/      # Composants partagés
├── hooks/           # Custom hooks
├── lib/             # Utilitaires et configurations
│   ├── supabase.ts  # Client Supabase
│   ├── jitsi.ts     # Configuration Jitsi
│   └── auth.ts      # Logique d'authentification
├── store/           # Stores Zustand
│   ├── roomStore.ts # Gestion d'état des salles
│   └── userStore.ts # Gestion d'état des utilisateurs
├── i18n/            # Fichiers d'internationalisation
│   ├── fr/          # Traductions françaises (défaut)
│   └── en/          # Traductions anglaises (future)
└── types/           # Définitions TypeScript
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

---