# Système de Permissions - Démarrage Rapide

## ✅ Installation terminée !

Le système de permissions a été installé avec succès dans votre application Next.js.

## 📁 Fichiers créés

```
src/
├── shared/
│   ├── lib/
│   │   └── permissions/
│   │       └── extractPermissions.ts      # Extraction des permissions
│   ├── contexts/
│   │   └── PermissionsContext.tsx         # Context React + usePermissions()
│   └── components/
│       └── permissions/
│           ├── Can.tsx                     # Composants <Can> et <Cannot>
│           └── index.ts                   # Barrel export
```

## 🔧 Fichiers modifiés

- ✅ `app/admin/layout.tsx` - Ajout du `<PermissionsProvider>`
- ✅ `src/modules/UsersGuard/admin/hooks/useAuth.ts` - Extraction et stockage des permissions

## 🚀 Comment utiliser

### 1. Utilisation de base avec le composant `<Can>`

```tsx
import { Can } from '@/src/shared/components/permissions'

export default function MyPage() {
  return (
    <div>
      {/* Vérifier un groupe */}
      <Can credential="1-FIDEALIS">
        <button>FIDEALIS Features</button>
      </Can>

      {/* Vérifier une permission */}
      <Can credential="contract_meeting_request_default_value">
        <button>Set Default Value</button>
      </Can>

      {/* Style Symfony 1 - OR logic */}
      <Can credential={[['admin', 'superadmin', 'users.edit']]}>
        <button>Edit User</button>
      </Can>
    </div>
  )
}
```

### 2. Utilisation dans le code avec le hook

```tsx
import { usePermissions } from '@/src/shared/contexts/PermissionsContext'

export default function MyComponent() {
  const { hasCredential, hasGroup } = usePermissions()

  const handleAction = () => {
    if (!hasCredential('admin')) {
      alert('Permission denied')
      return
    }
    // Effectuer l'action
  }

  return (
    <div>
      {hasCredential('users.edit') && (
        <button onClick={handleAction}>Edit</button>
      )}
    </div>
  )
}
```

## 🧪 Comment tester

### 1. Connectez-vous

Utilisez votre page de login habituelle. Le système extrait automatiquement les permissions.

### 2. Vérifiez la console

Après le login, vous devriez voir dans la console :

```
[useAuth] Permissions extracted: {
  total_permissions: XXX,
  groups: ["1-FIDEALIS", "1-ADMINISTRATEUR THEME GES", ...],
  is_admin: false,
  is_superadmin: false
}
```

### 3. Testez les permissions

Créez une page de test :

```tsx
// app/admin/test-permissions/page.tsx
'use client'

import { usePermissions } from '@/src/shared/contexts/PermissionsContext'
import { Can } from '@/src/shared/components/permissions'

export default function TestPermissionsPage() {
  const { permissions, hasCredential, hasGroup } = usePermissions()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Permissions</h1>

      {/* Afficher les permissions chargées */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Loaded Permissions</h2>
        <p>Username: {permissions?.username}</p>
        <p>Total permissions: {permissions?.permissions.length}</p>
        <p>Groups: {permissions?.groups.join(', ')}</p>
      </div>

      {/* Tester les groupes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Groups Test</h2>

        <Can credential="1-FIDEALIS">
          <div className="bg-green-100 p-4 rounded mb-2">
            ✅ You have access to 1-FIDEALIS
          </div>
        </Can>

        <Can credential="1-ADMINISTRATEUR THEME GES">
          <div className="bg-green-100 p-4 rounded mb-2">
            ✅ You have access to 1-ADMINISTRATEUR THEME GES
          </div>
        </Can>
      </div>

      {/* Tester les permissions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Permissions Test</h2>

        <Can credential="contract_meeting_request_default_value">
          <div className="bg-green-100 p-4 rounded mb-2">
            ✅ You can set default values
          </div>
        </Can>

        <Can credential="contract_new_partner_layer">
          <div className="bg-green-100 p-4 rounded mb-2">
            ✅ You can create new partner layers
          </div>
        </Can>
      </div>

      {/* Test avec code */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Code Test</h2>
        <p>hasCredential('1-FIDEALIS'): {hasCredential('1-FIDEALIS') ? '✅ true' : '❌ false'}</p>
        <p>hasGroup('1-FIDEALIS'): {hasGroup('1-FIDEALIS') ? '✅ true' : '❌ false'}</p>
      </div>

      {/* Afficher toutes les permissions */}
      <div>
        <h2 className="text-xl font-semibold mb-2">All Permissions</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(permissions, null, 2)}
        </pre>
      </div>
    </div>
  )
}
```

Accédez ensuite à : `http://localhost:3000/admin/test-permissions`

## 📖 Documentation complète

Pour plus d'informations, consultez :

- **Guide d'utilisation complet** : `PERMISSIONS_USAGE_GUIDE.md`
- **Backend Laravel** : `C:\laragon\www\backend-api\Modules\User\PERMISSIONS_API_DOCUMENTATION.md`
- **Guide Next.js** : `C:\laragon\www\backend-api\Modules\User\NEXTJS_PERMISSIONS_GUIDE.md`

## 🎯 Exemples concrets basés sur vos données

```tsx
import { Can } from '@/src/shared/components/permissions'

// Vérifier le groupe FIDEALIS
<Can credential="1-FIDEALIS">
  <FidealisPanel />
</Can>

// Vérifier une permission spécifique
<Can credential="app_domoprime_contract_view_fidealis">
  <ViewFidealisContract />
</Can>

// Style Symfony 1 - OR logic
<Can credential={[['admin', 'superadmin', 'settings_user_edit']]}>
  <EditUserButton />
</Can>
```

## ⚠️ Important

1. **Aucune requête supplémentaire** : Les permissions sont extraites UNE SEULE FOIS au login
2. **Persistance** : Les permissions sont sauvegardées dans localStorage
3. **Sécurité** : Le backend doit toujours vérifier les permissions (le frontend est pour l'UX)
4. **Déconnexion** : Les permissions sont automatiquement supprimées au logout

## 🐛 Dépannage

### Les permissions ne s'affichent pas

1. Vérifiez la console après le login
2. Vérifiez le localStorage : ouvrez DevTools > Application > Local Storage > `user_permissions`
3. Vérifiez que la réponse de login contient les groupes et permissions

### Erreur "usePermissions must be used within PermissionsProvider"

Le composant doit être à l'intérieur du `<PermissionsProvider>`. Vérifiez que vous êtes bien dans une page admin.

### Les permissions ne persistent pas

Vérifiez que localStorage est activé et que vous n'êtes pas en navigation privée.

## ✨ Prochaines étapes

1. Testez le système avec votre login habituel
2. Créez une page de test pour voir les permissions
3. Commencez à utiliser `<Can>` dans vos composants existants
4. Protégez vos pages avec le système de permissions

Bon développement ! 🚀
