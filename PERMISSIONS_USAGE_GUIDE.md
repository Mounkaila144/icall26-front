# Guide d'utilisation du système de Permissions Next.js

## Vue d'ensemble

Le système de permissions est maintenant intégré dans votre application Next.js. Il extrait automatiquement toutes les permissions lors de la connexion et les stocke en cache local (React Context + localStorage), **sans aucune requête supplémentaire** à l'API.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ 1. LOGIN (1 fois)                                       │
│    - API: POST /api/admin/auth/login                    │
│    - Réponse contient: user, groups, permissions, token │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. EXTRACTION (automatique)                             │
│    - extractPermissionsFromLogin() extrait toutes les   │
│      permissions depuis les groupes + permissions       │
│      directes de l'utilisateur                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. STOCKAGE (automatique)                               │
│    - React Context (en mémoire)                         │
│    - localStorage (persistance)                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. UTILISATION (partout dans l'app)                     │
│    - hasCredential() - Vérifier permissions             │
│    - <Can> - Affichage conditionnel                     │
│    - AUCUNE REQUÊTE RÉSEAU !                            │
└─────────────────────────────────────────────────────────┘
```

## Fichiers créés

| Fichier | Description |
|---------|-------------|
| `src/shared/lib/permissions/extractPermissions.ts` | Utilitaires d'extraction de permissions |
| `src/shared/contexts/PermissionsContext.tsx` | Context React + hook `usePermissions()` |
| `src/shared/components/permissions/Can.tsx` | Composants `<Can>` et `<Cannot>` |

## Modifications apportées

| Fichier | Modification |
|---------|--------------|
| `app/admin/layout.tsx` | Ajout du `<PermissionsProvider>` |
| `src/modules/UsersGuard/admin/hooks/useAuth.ts` | Extraction et stockage des permissions au login/logout |

## Utilisation

### 1. Hook `usePermissions()`

Le hook `usePermissions()` vous donne accès à toutes les fonctions de vérification de permissions.

```tsx
'use client'

import { usePermissions } from '@/src/shared/contexts/PermissionsContext'

export default function MyComponent() {
  const {
    hasCredential,
    hasGroup,
    isSuperadmin,
    isAdmin,
    permissions
  } = usePermissions()

  // Vérifier un credential simple (groupe OU permission)
  if (hasCredential('admin')) {
    console.log('User is admin')
  }

  // Vérifier plusieurs credentials (OR logic) - Style Symfony 1
  if (hasCredential([['admin', 'superadmin', 'users.edit']])) {
    console.log('User can edit users')
  }

  // Vérifier plusieurs credentials (AND logic)
  if (hasCredential(['users.view', 'users.edit'], true)) {
    console.log('User can view AND edit users')
  }

  // Vérifier un groupe spécifique
  if (hasGroup('1-FIDEALIS')) {
    console.log('User belongs to FIDEALIS group')
  }

  // Vérifier si superadmin
  if (isSuperadmin()) {
    console.log('User is superadmin - has all permissions')
  }

  // Vérifier si admin
  if (isAdmin()) {
    console.log('User is admin or superadmin')
  }

  // Accéder aux permissions directement
  console.log('Total permissions:', permissions?.permissions.length)
  console.log('Groups:', permissions?.groups)

  return <div>My Component</div>
}
```

### 2. Composant `<Can>`

Utilisez le composant `<Can>` pour afficher du contenu uniquement si l'utilisateur a les permissions requises.

```tsx
import { Can, Cannot } from '@/src/shared/components/permissions'

export default function UserManagement() {
  return (
    <div>
      <h1>User Management</h1>

      {/* Vérifier un seul credential */}
      <Can credential="admin">
        <button>Admin Panel</button>
      </Can>

      {/* Style Symfony 1 - OR logic */}
      <Can credential={[['admin', 'superadmin', 'settings_user_edit']]}>
        <button>Edit User</button>
      </Can>

      {/* Vérifier un groupe */}
      <Can credential="1-FIDEALIS">
        <div>FIDEALIS Features</div>
      </Can>

      {/* Vérifier une permission */}
      <Can credential="contract_meeting_request_default_value">
        <button>Set Default Value</button>
      </Can>

      {/* Multiple credentials (OR logic) */}
      <Can credential={['admin', 'users.edit']}>
        <button>Actions</button>
      </Can>

      {/* Multiple credentials (AND logic) */}
      <Can credential={['users.view', 'users.edit']} requireAll>
        <button>Edit with View</button>
      </Can>

      {/* Avec fallback */}
      <Can credential="admin" fallback={<p>Access denied</p>}>
        <AdminPanel />
      </Can>

      {/* Composant inverse - affiche si l'utilisateur N'A PAS la permission */}
      <Cannot credential="admin">
        <p>You are not an admin</p>
      </Cannot>
    </div>
  )
}
```

### 3. Dans le code JavaScript

```tsx
'use client'

import { usePermissions } from '@/src/shared/contexts/PermissionsContext'

export default function UserActions({ userId }: { userId: number }) {
  const { hasCredential, hasGroup } = usePermissions()

  const handleEdit = () => {
    // Vérification avant action
    if (!hasCredential([['admin', 'users.edit']])) {
      alert('Permission denied')
      return
    }

    // Effectuer l'action
    editUser(userId)
  }

  const handleDelete = () => {
    // Vérification AND logic
    if (!hasCredential(['users.view', 'users.delete'], true)) {
      alert('You need both view and delete permissions')
      return
    }

    // Effectuer l'action
    deleteUser(userId)
  }

  return (
    <div>
      {hasCredential('users.edit') && (
        <button onClick={handleEdit}>Edit</button>
      )}

      {hasCredential('users.delete') && (
        <button onClick={handleDelete}>Delete</button>
      )}

      {hasGroup('1-ADMINISTRATEUR THEME GES') && (
        <button onClick={() => exportData(userId)}>Export GES</button>
      )}
    </div>
  )
}
```

### 4. Protéger une page entière (HOC)

Créez un Higher-Order Component pour protéger des pages entières :

```tsx
// src/shared/hocs/withCredential.tsx
'use client'

import { usePermissions } from '@/src/shared/contexts/PermissionsContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function withCredential(
  Component: React.ComponentType,
  requiredCredential: string | string[] | string[][],
  requireAll = false
) {
  return function ProtectedComponent(props: any) {
    const { hasCredential, loading } = usePermissions()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !hasCredential(requiredCredential, requireAll)) {
        router.push('/admin/unauthorized')
      }
    }, [loading, hasCredential, router])

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )
    }

    if (!hasCredential(requiredCredential, requireAll)) {
      return null
    }

    return <Component {...props} />
  }
}
```

Utilisation :

```tsx
// app/admin/users/edit/[id]/page.tsx
'use client'

import { withCredential } from '@/src/shared/hocs/withCredential'

function UserEditPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Edit User {params.id}</h1>
      {/* Formulaire d'édition */}
    </div>
  )
}

// Protéger la page - Style Symfony 1 (OR logic)
export default withCredential(
  UserEditPage,
  [['superadmin', 'admin', 'settings_user_edit']]
)

// OU avec un seul credential
// export default withCredential(UserEditPage, 'admin')

// OU avec AND logic
// export default withCredential(UserEditPage, ['users.view', 'users.edit'], true)
```

## Exemples basés sur vos données

Selon la réponse de login que vous avez fournie, voici des exemples concrets :

```tsx
import { Can } from '@/src/shared/components/permissions'
import { usePermissions } from '@/src/shared/contexts/PermissionsContext'

export default function Dashboard() {
  const { hasCredential, hasGroup, permissions } = usePermissions()

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Afficher les infos utilisateur */}
      <p>Username: {permissions?.username}</p>
      <p>Groups: {permissions?.groups.join(', ')}</p>
      <p>Total permissions: {permissions?.permissions.length}</p>

      {/* Vérifier le groupe 1-FIDEALIS */}
      <Can credential="1-FIDEALIS">
        <div className="card">
          <h2>FIDEALIS Features</h2>
          {/* Contenu spécifique FIDEALIS */}
        </div>
      </Can>

      {/* Vérifier le groupe 1-ADMINISTRATEUR THEME GES */}
      <Can credential="1-ADMINISTRATEUR THEME GES">
        <div className="card">
          <h2>Admin GES Panel</h2>
          {/* Contenu spécifique Admin GES */}
        </div>
      </Can>

      {/* Vérifier une permission spécifique */}
      <Can credential="contract_meeting_request_default_value">
        <button>Set Default Value</button>
      </Can>

      <Can credential="app_domoprime_contract_view_fidealis">
        <button>View Fidealis Contracts</button>
      </Can>

      <Can credential="contract_new_partner_layer">
        <button>Create New Partner Layer</button>
      </Can>

      {/* Dans le code */}
      {hasCredential('meeting_update_no_cumac_generation') && (
        <div className="alert">
          ⚠️ Cumac generation is disabled for meeting updates
        </div>
      )}

      {hasGroup('1-5yousign evidence') && (
        <div className="card">
          <h2>Yousign Evidence Tools</h2>
          {/* Outils Yousign */}
        </div>
      )}
    </div>
  )
}
```

## Avantages

### Performance
- ✅ **1 seule requête** au login
- ✅ Vérifications **instantanées** (en mémoire)
- ✅ Pas de latence réseau
- ✅ Cache automatique

### Compatibilité Symfony 1
- ✅ Même syntaxe `hasCredential()`
- ✅ Même logique OR : `[['admin', 'superadmin']]`
- ✅ Même comportement : vérifie groupes + permissions

### Développement
- ✅ Type-safe (TypeScript complet)
- ✅ Simple à utiliser
- ✅ Composants réutilisables `<Can>`
- ✅ Hooks React standard

### Sécurité
- ✅ Validation côté serveur (middleware Laravel)
- ✅ Cache côté client pour UX
- ✅ Tokens Sanctum
- ✅ Multi-tenant compatible

## Syntaxes supportées

### 1. String simple
```typescript
hasCredential('admin')
// Vérifie si user a le groupe "admin" OU la permission "admin"
```

### 2. Array simple (OR logic)
```typescript
hasCredential(['admin', 'superadmin'])
// Vérifie si user a AU MOINS UN des credentials
```

### 3. Array imbriqué Symfony (OR logic)
```typescript
hasCredential([['admin', 'superadmin', 'users.edit']])
// Style Symfony 1 - Vérifie si user a AU MOINS UN des credentials
```

### 4. AND logic
```typescript
hasCredential(['users.view', 'users.edit'], true)
// Vérifie si user a TOUS les credentials
```

## Données extraites de votre login

Voici ce qui est extrait automatiquement depuis votre réponse de login :

```json
{
  "permissions": [
    "contract_meeting_request_default_value",
    "contract_meeting_polluter_not_empty_value",
    "meeting_update_no_cumac_generation",
    "app_domoprime_contract_view_fidealis",
    "contract_meeting_previous_energy_default_value",
    "contract_view_fidealis_folder_list",
    "contract_new_partner_layer",
    "contract_view_list_partner_layer",
    "app_domoprime_contract_view_quotation_yousign_evidence_signature_start",
    "app_domoprime_contract_view_billing_yousign_evidence_signature_start",
    "app_domoprime_iso2_contract_new_pricing"
    // ... et toutes les autres permissions de vos groupes
  ],
  "groups": [
    "1-FIDEALIS",
    "1-ADMINISTRATEUR THEME GES",
    "1-5yousign evidence",
    // ... tous vos groupes
  ],
  "is_superadmin": false,
  "is_admin": false,
  "user_id": 341,
  "username": "admin"
}
```

## Debugging

Pour voir les permissions chargées :

```tsx
import { usePermissions } from '@/src/shared/contexts/PermissionsContext'

export default function DebugPermissions() {
  const { permissions } = usePermissions()

  return (
    <div>
      <h2>Loaded Permissions</h2>
      <pre>{JSON.stringify(permissions, null, 2)}</pre>
    </div>
  )
}
```

## Notes importantes

1. **Aucune requête supplémentaire** : Toutes les permissions sont extraites au login uniquement
2. **Persistance** : Les permissions sont sauvegardées dans localStorage et rechargées au refresh
3. **Sécurité** : La vérification côté client est pour l'UX uniquement. Le backend doit toujours valider les permissions
4. **Superadmin** : Si `is_superadmin: true`, `hasCredential()` retourne toujours `true`
5. **Vérification double** : `hasCredential()` vérifie d'abord les groupes, puis les permissions (comme Symfony 1)

## Support

- **Backend Laravel** : Voir `C:\laragon\www\backend-api\Modules\User\PERMISSIONS_API_DOCUMENTATION.md`
- **Guide rapide Next.js** : Voir `C:\laragon\www\backend-api\Modules\User\NEXTJS_PERMISSIONS_GUIDE.md`
- **Résumé complet** : Voir `C:\laragon\www\backend-api\Modules\User\RESUME_PERMISSIONS.md`
