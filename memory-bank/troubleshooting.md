# Troubleshooting - Problèmes connus et solutions

Ce document recense les problèmes techniques rencontrés durant le développement du projet Nimbo et les solutions adoptées.

## Problèmes de version Node.js

### Problème
Next.js 14 nécessite Node.js 18.17.0 ou supérieur, mais le système pouvait utiliser une version inférieure (18.10.0), ce qui entraînait des erreurs.

### Solution
1. Ajout d'un fichier `.nvmrc` à la racine du projet avec le contenu `18.17.0`
2. Utilisation de la commande `nvm use` pour activer la bonne version avant de travailler sur le projet
3. Note : le fichier `.nvmrc` n'est pas automatiquement utilisé au changement de dossier, il faut explicitement l'activer

### Commandes utiles
```bash
# Vérifier la version actuelle de Node.js
node -v

# Lister les versions disponibles
nvm ls

# Activer la version spécifiée dans .nvmrc
nvm use
```

## Conflit de configuration ESLint

### Problème
Le projet utilise ESLint v9.25.1, qui est incompatible avec la configuration standard de Next.js (utilise les anciennes options de configuration). Cela provoquait les erreurs suivantes :

```
Invalid Options:
- Unknown options: useEslintrc, extensions, resolvePluginsRelativeTo, rulePaths, ignorePath, reportUnusedDisableDirectives
- 'extensions' has been removed.
- 'resolvePluginsRelativeTo' has been removed.
- 'ignorePath' has been removed.
- 'rulePaths' has been removed. Please define your rules using plugins.
- 'reportUnusedDisableDirectives' has been removed.
```

### Solution
1. Suppression du fichier `.eslintrc.json` traditionnel
2. Création d'un fichier `eslint.config.mjs` utilisant le nouveau format de configuration "flat" d'ESLint v9
3. Installation des plugins nécessaires : `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `@next/eslint-plugin-next`
4. Configuration spécifique pour les fichiers de configuration JS (globals)
5. Assouplissement de certaines règles pour le développement

### Code de configuration fonctionnel
```javascript
import js from '@eslint/js';
import tsPlugin from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  js.configs.recommended,
  ...tsPlugin.configs.recommended,
  // Configuration pour les fichiers de config JS
  {
    files: ['*.config.js', 'next.config.js', 'check-node.js'],
    languageOptions: {
      globals: {
        module: 'writable',
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        exports: 'writable',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      next: nextPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Règles React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Règles Next.js (uniquement celles qui existent)
      'next/no-html-link-for-pages': 'error',
      
      // Désactiver temporairement les règles trop strictes pour le développement
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'dist/**',
      'build/**',
      '**/*.d.ts',
    ],
  },
];
```

### Notes
- ESLint v9 utilise un format de configuration complètement différent des versions précédentes
- La règle `next/core-web-vitals` n'est pas disponible dans la version actuelle du plugin
- Les règles trop strictes comme `@typescript-eslint/no-explicit-any` sont mises en avertissement au lieu d'erreur pour accélérer le développement

## Problèmes avec les apostrophes en JSX

### Problème
JSX interprète les apostrophes simples (`'`) comme des délimiteurs de chaînes de caractères, ce qui peut causer des erreurs dans les textes français.

### Solution
Utilisation de `&apos;` à la place des apostrophes simples dans les textes JSX.

### Exemple
```jsx
// Incorrect (erreur JSX)
<p>L'application est en cours de développement</p>

// Correct
<p>L&apos;application est en cours de développement</p>
```

## Problèmes avec les chemins d'accès

### Problème
Le projet est dans un sous-dossier (nimbo-app) du dépôt principal (nimbo), ce qui peut causer des confusions lors de l'exécution des commandes.

### Solution
- S'assurer d'être dans le dossier nimbo-app avant d'exécuter les commandes
- Vérifier le chemin avec `pwd` en cas de doute
- Utiliser des chemins absolus quand nécessaire

### Commandes utiles
```bash
# Vérifier le dossier courant
pwd

# Aller dans le dossier nimbo-app
cd /home/kevin/Projects/nimbo/nimbo-app
```

## Problème de persistance de la session d'authentification

### Problème
Malgré l'implémentation du `userStore` avec Zustand, la session d'authentification n'était pas maintenue lors de la navigation ou du rechargement de la page.

### Cause
Deux problèmes principaux ont été identifiés :
1. Utilisation de `sessionStorage` au lieu de `localStorage` dans le store Zustand, ce qui limite la persistance à l'onglet du navigateur actuel
2. Absence d'un mécanisme automatique pour initialiser et synchroniser l'état d'authentification au chargement de l'application

### Solution
1. Modification du store pour utiliser `localStorage` :
```typescript
storage: createJSONStorage(() => localStorage)
```

2. Création d'un composant `AuthProvider` qui initialise l'authentification et écoute les changements :
```typescript
'use client';

export function AuthProvider({ children }) {
  const { fetchUserData } = useUserStore();

  useEffect(() => {
    fetchUserData();
    
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  return <>{children}</>;
}
```

3. Ajout de ce provider à la racine de l'application dans `app/layout.tsx`

### Résultat
La session d'authentification est maintenant correctement maintenue entre les navigations et même après le rechargement de la page. Le `AuthProvider` assure que l'état d'authentification est toujours synchronisé avec Supabase. 

## Synchronisation entre Auth et table Users

### Problème
Après authentification réussie via Supabase Auth, la requête à la table `users` échouait avec l'erreur `PGRST116` : "JSON object requested, multiple (or no) rows returned" car l'utilisateur existait dans la table d'authentification mais pas dans la table personnalisée `users`.

### Cause
Lorsqu'un utilisateur s'authentifie, une entrée est automatiquement créée dans le système d'authentification de Supabase (`auth.users`), mais aucune entrée correspondante n'est créée automatiquement dans la table personnalisée `users`. L'utilisation de `.single()` sur une requête qui ne retourne aucun résultat provoque l'erreur.

### Solution
Modification de `fetchUserData` dans le `userStore` pour :
1. Utiliser `.maybeSingle()` au lieu de `.single()` pour éviter l'erreur si l'utilisateur n'existe pas
2. Créer automatiquement une entrée dans la table `users` si l'utilisateur existe dans `auth.users` mais pas dans `users`

```typescript
// Tenter de récupérer l'utilisateur
const { data: userData, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', authUser.id)
  .maybeSingle(); // Au lieu de single()

// Si l'utilisateur n'existe pas dans la table users, le créer
if (!userData && !error) {
  // Créer un nouvel utilisateur dans la table users
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      id: authUser.id,
      email: authUser.email,
      status: 'ONLINE',
      display_name: authUser.email?.split('@')[0], // Utiliser le nom d'utilisateur de l'email
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (createError) throw createError;
  set({ user: newUser, isLoading: false });
} else if (error && error.code !== 'PGRST116') {
  // Si c'est une autre erreur, la lancer
  throw error;
} else {
  // Si l'utilisateur existe déjà, l'utiliser
  set({ user: userData, isLoading: false });
}
```

### Résultat
Les utilisateurs sont maintenant automatiquement créés dans la table personnalisée `users` lors de la première authentification, et la session persiste correctement. 

## Problème d'autorisation RLS sur la table users

### Problème
Lors de la tentative d'insertion d'un utilisateur dans la table `users`, l'erreur suivante apparaît :
```
code: "42501"
message: "new row violates row-level security policy for table \"users\""
```

### Cause
1. Le schéma SQL contient un trigger `on_auth_user_created` qui est censé créer automatiquement un utilisateur dans la table `users` après l'inscription, mais il semble ne pas fonctionner correctement dans certains cas.
2. Les politiques RLS (Row Level Security) de la table `users` ne permettent pas aux utilisateurs d'insérer des données, seulement de les sélectionner et de les mettre à jour.

### Solution
1. Modification du `userStore` pour ne pas tenter de créer un utilisateur, mais plutôt afficher un message d'erreur explicite.
2. Exécution d'une requête SQL côté administrateur pour vérifier et créer les utilisateurs manquants :

```sql
-- Fonction pour synchroniser les utilisateurs auth.users et public.users
CREATE OR REPLACE FUNCTION sync_missing_users() RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    FOR auth_user IN 
        SELECT au.id, au.email 
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
    LOOP
        INSERT INTO public.users (id, email, status, created_at, updated_at)
        VALUES (
            auth_user.id, 
            auth_user.email, 
            'ONLINE',
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created user for %', auth_user.email;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exécuter la fonction
SELECT sync_missing_users();

-- Vérifier que tous les utilisateurs sont bien synchronisés
SELECT au.id, au.email, pu.id IS NOT NULL AS has_profile
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;
```

3. Si nécessaire, ajout d'une politique RLS spécifique pour permettre aux utilisateurs de s'insérer eux-mêmes :

```sql
-- Politique pour permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Les utilisateurs peuvent créer leur propre profil"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Résultat
Les utilisateurs sont maintenant correctement synchronisés entre la table `auth.users` et la table `public.users`. Le message d'erreur explicite guide l'utilisateur pour se déconnecter et se reconnecter, ce qui devrait déclencher à nouveau le trigger et résoudre le problème. 

## Problème de redirection après authentification

### Problème
Même si l'utilisateur est correctement connecté (et visible dans l'interface de la page d'accueil), toute tentative d'accès aux pages protégées comme `/dashboard` ou `/profile` provoque une redirection vers la page de connexion.

### Cause
Le middleware qui vérifie l'authentification recherchait un cookie spécifique nommé `sb-auth-token`, mais Supabase utilise des noms de cookies différents comme `sb-<project-ref>-access-token` ou `sb-<project-ref>-refresh-token`.

### Solution
Modification du middleware pour rechercher tous les cookies d'authentification possibles de Supabase :

```javascript
// Avant - Problématique
const supabaseCookie = request.cookies.get('sb-auth-token');
const isAuthenticated = !!supabaseCookie;

// Après - Solution
const isAuthenticated = Array.from(request.cookies.getAll())
  .some(cookie => 
    cookie.name.includes('access-token') || 
    cookie.name.includes('refresh-token') || 
    cookie.name.includes('auth-token')
  );
```

### Résultat
Les utilisateurs peuvent maintenant accéder aux pages protégées après s'être connectés, sans être redirigés inutilement vers la page de connexion. 

## Problème de Server vs Client Components dans Next.js

### Problème
Erreur lors du chargement de la page d'accueil :
```
Error: You're importing a component that needs useState. It only works in a Client Component but none of its parents are marked with "use client", so they're Server Components by default.
```

### Cause
Dans Next.js App Router, tous les composants sont par défaut des Server Components. Les composants utilisant des fonctionnalités côté client comme `useState`, `useEffect`, ou des événements interactifs doivent être explicitement marqués comme Client Components avec la directive `'use client'` en haut du fichier.

Le problème est survenu lors de l'importation du composant `HomeHeader` (qui utilise `useState` et est marqué comme Client Component) dans le fichier `page.tsx` (qui est un Server Component par défaut).

### Solution
Deux approches possibles :

1. **Convertir la page entière en Client Component** :
```typescript
// src/app/page.tsx
'use client'; // Ajouter cette directive en haut du fichier

import { HomeHeader } from '@/components/HomeHeader';
// ...reste du code
```

2. **Pattern de séparation Server/Client** (approche recommandée) :
- Créer un composant client séparé qui contient toute la logique côté client
- Importer ce composant dans le Server Component
```typescript
// src/components/HomePage.tsx
'use client';
// Tout le code de la page avec les composants clients

// src/app/page.tsx (reste un Server Component)
import { HomePage } from '@/components/HomePage';
export default function Home() {
  return <HomePage />;
}
```

### Résultat
La page se charge correctement sans erreur, tout en maintenant une architecture qui maximise les avantages des Server Components de Next.js (meilleure performance, SEO, etc.). 

## Problème avec le typage TypeScript pour Supabase Realtime

### Problème
Lors de l'implémentation des fonctionnalités temps réel avec Supabase, plusieurs erreurs de typage TypeScript sont apparues :

1. Erreurs pour les paramètres des fonctions de callback :
   ```
   Parameter 'event' implicitly has an 'any' type.
   Parameter 'payload' implicitly has an 'any' type.
   Parameter 'participant' implicitly has an 'any' type.
   ```

2. Les méthodes de l'API Realtime de Supabase n'étaient pas correctement typées :
   ```
   No overload matches this call.
   The last overload gave the following error.
   Argument of type '"postgres_changes"' is not assignable to parameter of type '"system"'.
   ```

3. Utilisation incorrecte de la directive de suppression d'erreurs :
   ```
   Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
   ```

### Cause
Les types fournis par la bibliothèque Supabase n'étaient pas à jour avec l'API Realtime actuelle. En particulier, l'événement `postgres_changes` et les méthodes associées à la présence (`track`, `untrack`, `presenceState`) n'étaient pas correctement définis dans les types.

### Solution
1. Création d'un fichier de déclaration de types personnalisé `src/types/declarations.d.ts` pour étendre les types de Supabase :

```typescript
// Extension des types Supabase pour Realtime
declare module '@supabase/supabase-js' {
  export interface RealtimePostgresChangesPayload<T> {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T;
    old: T;
    schema: string;
    table: string;
    commit_timestamp: string;
    errors: any[];
  }

  interface RealtimePresenceState<T extends Record<string, any> = any> {
    [key: string]: T[];
  }
  
  export interface PresenceData {
    id: string;
    status?: string;
    lastSeen?: string;
    [key: string]: any;
  }
  
  export interface PresencePayload {
    newPresences?: PresenceData[];
    leftPresences?: PresenceData[];
  }

  export interface RealtimeSystemEvent {
    event: string;
    detail?: {
      message?: string;
      [key: string]: any;
    };
  }

  interface RealtimeChannel {
    on(
      event: 'postgres_changes',
      schema: { event: string; schema: string; table: string; filter?: any },
      callback: (payload: RealtimePostgresChangesPayload<any>) => void
    ): RealtimeChannel;
    
    on(
      event: 'presence',
      schema: { event: string },
      callback: (payload: PresencePayload) => void
    ): RealtimeChannel;
    
    on(
      event: 'system',
      schema: { event: string },
      callback: (payload: RealtimeSystemEvent) => void
    ): RealtimeChannel;
    
    track(presence: Record<string, any>): Promise<void>;
    untrack(): Promise<void>;
    presenceState(): RealtimePresenceState;
    subscribe(callback?: (status: string) => void): RealtimeChannel;
  }
}
```

2. Remplacement des directives `@ts-ignore` par `@ts-expect-error` lorsque nécessaire, bien que cela soit devenu largement inutile grâce à l'extension des types.

3. Typage explicite des paramètres de callback dans tous les hooks temps réel :
   ```typescript
   .on('presence', { event: 'join' }, ({ newPresences }: PresencePayload) => {
     // Code...
   })
   ```

4. Création d'interfaces spécifiques pour les données brutes reçues des requêtes Supabase :
   ```typescript
   interface RawParticipant {
     id: string;
     user_id: string;
     // ... autres propriétés
     users: {
       id: string;
       display_name: string;
       // ... autres propriétés
     };
   }
   ```

### Résultat
Ces modifications ont permis de résoudre toutes les erreurs de typage liées à Realtime, tout en conservant les avantages de la vérification de type TypeScript. Les interfaces personnalisées fournissent une meilleure expérience de développement et aident à éviter les erreurs potentielles lors de l'accès aux propriétés des objets retournés par Supabase. 

## Problèmes avec Next.js 15

### Incompatibilité de version Node.js

**Problème**: Next.js 15 requiert Node.js 18.18.0 ou supérieur, mais le projet utilise une version inférieure.

```
You are using Node.js 18.10.0. For Next.js, Node.js version "^18.18.0 || ^19.8.0 || >= 20.0.0" is required.
```

**Solution temporaire**:
- Utiliser le script `dev-nextjs15.js` qui ignore la vérification de version:
  ```bash
  npm run dev:next15
  ```

**Solution permanente**:
- Mettre à jour Node.js vers une version compatible:
  ```bash
  nvm install 18.18.0
  nvm use 18.18.0
  ```

### API Cookies asynchrone

**Problème**: L'API cookies() est devenue asynchrone dans Next.js 15, causant des erreurs:

```
Error: Route "/dashboard" used `cookies().get('...')`. `cookies()` should be awaited before using its value
```

**Solution**:
- Ajouter `await` devant chaque appel à `cookies()`:
  ```typescript
  // Avant
  const cookieStore = cookies();
  
  // Après
  const cookieStore = await cookies();
  ```

- S'assurer que la fonction contenante est asynchrone:
  ```typescript
  export async function createClient() {
    const cookieStore = await cookies();
    // ...
  }
  ```

### Règles ESLint obsolètes

**Problème**: Certaines règles ESLint de Next.js ont changé dans la version 15.

**Solution**:
- Mettre à jour les règles dans `eslint.config.mjs`:
  ```javascript
  // Remplacer
  'next/link-passhref': 'error',
  
  // Par
  'next/no-html-link-for-pages': 'error',
  ```

### Problèmes de routes

**Problème**: Changements dans le comportement des routes dynamiques.

**Solution**:
- Vérifier que les handlers de route incluent les méthodes HTTP appropriées
- S'assurer que les segments dynamiques sont correctement typés