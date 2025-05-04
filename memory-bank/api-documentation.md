# Documentation des API - Nimbo

Cette documentation détaille tous les endpoints API disponibles dans l'application Nimbo.

## Table des matières

- [Authentification](#authentification)
- [Utilisateurs](#utilisateurs)
- [Workspaces](#workspaces)
- [Membres de workspace](#membres-de-workspace)
- [Salles](#salles)
- [Participants aux salles](#participants-aux-salles)
- [Messages](#messages)

## Format de réponse standard

Toutes les API renvoient un format de réponse standardisé :

### Réponse réussie
```json
{
  "success": true,
  "data": { ... }
}
```

### Réponse d'erreur
```json
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Description de l'erreur",
    "details": { ... } // optionnel
  }
}
```

## Authentification

### Déconnexion
```
POST /auth/signout
```
Déconnecte l'utilisateur de l'application.

## Utilisateurs

### Récupérer la liste des utilisateurs
```
GET /api/users
```
Récupère la liste des utilisateurs avec pagination et filtres.

**Paramètres de requête :**
- `page` : Numéro de page (défaut : 1)
- `pageSize` : Nombre d'éléments par page (défaut : 20, max : 50)
- `query` : Terme de recherche pour filtrer les résultats

**Réponse :**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "display_name": "Nom utilisateur",
        "avatar_url": "https://...",
        "email": "user@example.com",
        "created_at": "2023-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Récupérer le profil utilisateur
```
GET /api/users/me
```
Récupère le profil complet de l'utilisateur connecté, y compris ses workspaces.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "display_name": "Nom utilisateur",
    "avatar_url": "https://...",
    "email": "user@example.com",
    "bio": "Description de l'utilisateur",
    "status": "online",
    "status_message": "Message de statut",
    "workspaces": {
      "owned": [
        { "id": "uuid", "name": "Workspace 1" }
      ],
      "member": [
        { "id": "uuid", "name": "Workspace 2", "role": "admin" }
      ]
    }
  }
}
```

### Mettre à jour le profil utilisateur
```
PUT /api/users/me
```
Modifie le profil de l'utilisateur connecté.

**Corps de la requête :**
```json
{
  "display_name": "Nouveau nom",
  "avatar_url": "https://...",
  "bio": "Nouvelle bio",
  "timezone": "Europe/Paris"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "display_name": "Nouveau nom",
    "avatar_url": "https://...",
    "email": "user@example.com",
    "bio": "Nouvelle bio",
    "timezone": "Europe/Paris",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### Mettre à jour le statut utilisateur
```
PUT /api/users/me/status
```
Modifie le statut et/ou le message de statut de l'utilisateur.

**Corps de la requête :**
```json
{
  "status": "busy",
  "status_message": "En réunion jusqu'à 15h"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "display_name": "Nom utilisateur",
    "avatar_url": "https://...",
    "status": "busy",
    "status_message": "En réunion jusqu'à 15h"
  }
}
```

### Rechercher des utilisateurs
```
GET /api/users/search
```
Recherche des utilisateurs par nom ou email (utile pour les invitations).

**Paramètres de requête :**
- `query` : Terme de recherche (minimum 2 caractères)
- `workspaceId` : ID du workspace (optionnel, pour exclure les membres existants)

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "display_name": "Nom utilisateur",
      "avatar_url": "https://...",
      "email": "user@example.com"
    }
  ]
}
```

## Workspaces

### Récupérer tous les workspaces
```
GET /api/workspaces
```
Récupère tous les workspaces dont l'utilisateur est propriétaire ou membre.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Nom du workspace",
      "description": "Description",
      "logo_url": "https://...",
      "owner_id": "uuid",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### Créer un workspace
```
POST /api/workspaces
```
Crée un nouveau workspace.

**Corps de la requête :**
```json
{
  "name": "Nom du workspace",
  "description": "Description du workspace",
  "logo_url": "https://..."
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nom du workspace",
    "description": "Description du workspace",
    "logo_url": "https://...",
    "owner_id": "uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### Récupérer un workspace
```
GET /api/workspaces/:id
```
Récupère les détails d'un workspace spécifique.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nom du workspace",
    "description": "Description",
    "logo_url": "https://...",
    "owner_id": "uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### Modifier un workspace
```
PUT /api/workspaces/:id
```
Modifie un workspace existant (propriétaire uniquement).

**Corps de la requête :**
```json
{
  "name": "Nouveau nom",
  "description": "Nouvelle description",
  "logo_url": "https://..."
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nouveau nom",
    "description": "Nouvelle description",
    "logo_url": "https://...",
    "owner_id": "uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### Supprimer un workspace
```
DELETE /api/workspaces/:id
```
Supprime un workspace (propriétaire uniquement).

**Réponse :**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

## Membres de workspace

### Récupérer les membres d'un workspace
```
GET /api/workspaces/:id/members
```
Récupère tous les membres d'un workspace, y compris le propriétaire.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": null,
      "role": "owner",
      "user_id": "uuid",
      "workspace_id": "uuid",
      "users": {
        "id": "uuid",
        "display_name": "Nom propriétaire",
        "avatar_url": "https://...",
        "email": "owner@example.com"
      }
    },
    {
      "id": "uuid",
      "role": "admin",
      "user_id": "uuid",
      "workspace_id": "uuid",
      "created_at": "2023-01-01T00:00:00Z",
      "users": {
        "id": "uuid",
        "display_name": "Nom admin",
        "avatar_url": "https://...",
        "email": "admin@example.com"
      }
    }
  ]
}
```

### Ajouter un membre
```
POST /api/workspaces/:id/members
```
Ajoute un membre à un workspace (propriétaire ou admin uniquement).

**Corps de la requête :**
```json
{
  "user_id": "uuid",
  "role": "member" // "admin" ou "member"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "workspace_id": "uuid",
    "user_id": "uuid",
    "role": "member",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

### Récupérer un membre spécifique
```
GET /api/workspaces/:id/members/:userId
```
Récupère les détails d'un membre spécifique du workspace.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "admin",
    "user_id": "uuid",
    "workspace_id": "uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "users": {
      "id": "uuid",
      "display_name": "Nom utilisateur",
      "avatar_url": "https://...",
      "email": "user@example.com"
    }
  }
}
```

### Modifier le rôle d'un membre
```
PUT /api/workspaces/:id/members/:userId
```
Modifie le rôle d'un membre (propriétaire uniquement pour les admins, admin pour les membres).

**Corps de la requête :**
```json
{
  "role": "admin" // "admin" ou "member"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "admin",
    "user_id": "uuid",
    "workspace_id": "uuid",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

### Supprimer un membre
```
DELETE /api/workspaces/:id/members/:userId
```
Supprime un membre du workspace (propriétaire pour tous, admin pour les membres, ou soi-même).

**Réponse :**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

## Salles

### Récupérer les salles d'un workspace
```
GET /api/workspaces/:id/rooms
```
Récupère toutes les salles d'un workspace avec le nombre de participants.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Nom de la salle",
      "description": "Description",
      "type": "meeting",
      "capacity": 10,
      "workspace_id": "uuid",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z",
      "participant_count": 3
    }
  ]
}
```

### Créer une salle
```
POST /api/workspaces/:id/rooms
```
Crée une nouvelle salle dans un workspace (propriétaire ou admin uniquement).

**Corps de la requête :**
```json
{
  "name": "Nom de la salle",
  "description": "Description de la salle",
  "type": "meeting", // "meeting", "lounge", "focus" ou "general"
  "capacity": 10 // optionnel
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nom de la salle",
    "description": "Description de la salle",
    "type": "meeting",
    "capacity": 10,
    "workspace_id": "uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### Récupérer une salle
```
GET /api/workspaces/:id/rooms/:roomId
```
Récupère les détails d'une salle spécifique avec ses participants actuels.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nom de la salle",
    "description": "Description",
    "type": "meeting",
    "capacity": 10,
    "workspace_id": "uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "participants": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "joined_at": "2023-01-01T00:00:00Z",
        "video_enabled": true,
        "audio_enabled": true,
        "users": {
          "id": "uuid",
          "display_name": "Nom utilisateur",
          "avatar_url": "https://...",
          "status": "online",
          "status_message": "Message de statut"
        }
      }
    ]
  }
}
```

### Modifier une salle
```
PUT /api/workspaces/:id/rooms/:roomId
```
Modifie une salle existante (propriétaire ou admin uniquement).

**Corps de la requête :**
```json
{
  "name": "Nouveau nom",
  "description": "Nouvelle description",
  "type": "lounge",
  "capacity": 5
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nouveau nom",
    "description": "Nouvelle description",
    "type": "lounge",
    "capacity": 5,
    "workspace_id": "uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### Supprimer une salle
```
DELETE /api/workspaces/:id/rooms/:roomId
```
Supprime une salle (propriétaire ou admin uniquement).

**Réponse :**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

## Participants aux salles

### Récupérer les participants d'une salle
```
GET /api/rooms/:id/participants
```
Récupère tous les participants actuellement présents dans une salle.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "joined_at": "2023-01-01T00:00:00Z",
      "video_enabled": true,
      "audio_enabled": true,
      "users": {
        "id": "uuid",
        "display_name": "Nom utilisateur",
        "avatar_url": "https://...",
        "status": "online",
        "status_message": "Message de statut"
      }
    }
  ]
}
```

### Rejoindre une salle
```
POST /api/rooms/:id/participants
```
Rejoint une salle (quitte automatiquement toute autre salle du même workspace).

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "room_id": "uuid",
    "user_id": "uuid",
    "joined_at": "2023-01-01T00:00:00Z",
    "video_enabled": true,
    "audio_enabled": true
  }
}
```

### Mettre à jour l'état audio/vidéo
```
PUT /api/rooms/:id/participants/:userId
```
Modifie l'état audio/vidéo d'un participant (uniquement soi-même).

**Corps de la requête :**
```json
{
  "video_enabled": false,
  "audio_enabled": true
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "room_id": "uuid",
    "user_id": "uuid",
    "joined_at": "2023-01-01T00:00:00Z",
    "video_enabled": false,
    "audio_enabled": true
  }
}
```

### Quitter une salle
```
DELETE /api/rooms/:id/participants/:userId
```
Quitte une salle (soi-même) ou expulse un participant (admin uniquement).

**Réponse :**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

## Messages

### Récupérer les messages d'une salle
```
GET /api/rooms/:id/messages
```
Récupère les messages d'une salle avec pagination.

**Paramètres de requête :**
- `limit` : Nombre maximum de messages à récupérer (défaut : 50, max : 100)
- `before` : ID du message pour la pagination

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Contenu du message",
      "created_at": "2023-01-01T00:00:00Z",
      "user_id": "uuid",
      "users": {
        "id": "uuid",
        "display_name": "Nom utilisateur",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

### Envoyer un message
```
POST /api/rooms/:id/messages
```
Envoie un message dans une salle (nécessite d'être présent dans la salle).

**Corps de la requête :**
```json
{
  "content": "Contenu du message"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Contenu du message",
    "created_at": "2023-01-01T00:00:00Z",
    "user_id": "uuid",
    "users": {
      "id": "uuid",
      "display_name": "Nom utilisateur",
      "avatar_url": "https://..."
    }
  }
}
```

### Supprimer un message
```
DELETE /api/rooms/:id/messages/:messageId
```
Supprime un message (auteur du message, admin ou propriétaire du workspace uniquement).

**Réponse :**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
``` 