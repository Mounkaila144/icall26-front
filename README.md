
Étapes de Migration

Phase 1️⃣ : Configuration & Infrastructure de Bas

1.1 Copier la structure des modules
- Copier src/modules/ entier vers le template
- Copier src/shared/ entier vers le template

1.2 Configuration TypeScript & Paths
- Ajouter les path aliases manquants dans tsconfig.json :
  - @/modules/* → ./src/modules/*
  - @/shared/* → ./src/shared/*

1.3 Dépendances
- Installer axios (HTTP client)
- Installer date-fns (déjà présent dans le template)
- Vérifier compatibilité des versions React/Next.js

1.4 Variables d'environnement
- Ajouter NEXT_PUBLIC_API_URL dans .env
- Configurer l'URL de votre API Laravel backend

Phase 2️⃣ : Contextes Globaux & API Clien

2.1 Intégrer les contextes dans Providers
- Ajouter TenantProvider dans src/components/Providers.tsx
- Ajouter PermissionsProvider
- Ajouter LanguageProvider (adapter avec l'i18n existant du template)
- Ajouter SidebarProvider
- Conserver TranslationProvider

2.2 API Client
- Intégrer src/shared/lib/api-client.ts
- Adapter pour fonctionner avec NextAuth du template
- Maintenir les interceptors (X-Tenant-ID, Authorization, Locale)

2.3 Hooks partagés
- Copier tous les hooks de src/shared/hooks/
- Adapter si nécessaire pour MUI

Phase 3️⃣ : Routing Dynamiqu

3.1 Structure de routing
- Créer src/app/[lang]/(dashboard)/(private)/admin/[...slug]/page.tsx
- Copier la logique de routing dynamique
- Adapter le DynamicModuleLoader

3.2 Middleware
- Adapter middleware.ts pour le multi-tenant
- Intégrer avec l'i18n du template (en/fr/ar)

3.3 Menu dynamique
- Intégrer le système de menu depuis la base de données
- Adapter le menuService pour fonctionner avec le sidebar du template

Phase 4️⃣ : Authentificatio

4.1 Intégration UsersGuard + NextAuth
- Adapter UsersGuard/admin/services/authService.ts avec NextAuth
- Modifier src/libs/auth.ts pour utiliser votre API Laravel
- Conserver le système de token et permissions

4.2 Pages de login
- Remplacer le LoginForm du template par votre UsersGuard/admin/components/LoginForm.tsx
- Convertir vers MUI (TextField, Button, etc.)
- Garder la logique d'authentification multi-tenant

4.3 Auth Guards
- Remplacer src/hocs/AuthGuard.tsx par votre logique UsersGuard
- Intégrer avec PermissionsContext

Phase 5️⃣ : Conversion des Composants vers MU

5.1 Dashboard & Sidebar
- Convertir Dashboard/admin/components/Sidebar.tsx vers MUI Drawer
- Intégrer avec le VerticalMenu existant du template
- Adapter MenuManager, MenuForm, MenuList vers MUI (Dialog, Table, Form)

5.2 Module Customers
- Convertir Customers/admin/components/Customers.tsx :
  - Table → MUI DataGrid ou Table avec @tanstack/react-table
  - Boutons → MUI Button
  - Inputs → MUI TextField
  - Filtres → MUI Select, Autocomplete
- Adapter le système de pagination

5.3 Module CustomersContracts
- Convertir tous les composants vers MUI
- Adapter les formulaires avec react-hook-form + valibot (déjà dans le template)

5.4 Module Users
- Convertir la gestion des utilisateurs vers MUI
- Utiliser les composants de table du template

5.5 Module Site (Superadmin)
- Convertir l'interface superadmin vers MUI
- Créer la structure app/[lang]/(dashboard)/(private)/superadmin/

5.6 Autres modules
- CustomersContractsState
- Tous les autres modules identifiés

Phase 6️⃣ : Navigation & Men

6.1 Adapter le Sidebar
- Intégrer votre logique de menu dynamique dans src/components/layout/vertical/VerticalMenu.tsx
- Utiliser le système de permissions pour afficher/masquer les items
- Convertir le style vers MUI

6.2 Menu configuration
- Intégrer l'API /api/menu-config/route.ts
- Adapter le service de menus pour charger depuis Laravel

6.3 Navbar
- Fusionner votre Navbar avec src/components/layout/vertical/Navbar.tsx
- Ajouter les éléments spécifiques ( sélecteur de tenant si nécessaire)

Phase 7️⃣ : Internationalisatio

7.1 Fusionner les systèmes i18n
- Adapter votre TranslationProvider avec le système du template (en/fr/ar)
- Copier vos fichiers de traduction
- Utiliser le hook useTranslation dans tous les composants

7.2 Traductions modules
- Migrer toutes les traductions de vos modules
- Adapter au format du template si nécessaire

Phase 8️⃣ : Styling & Thèm

8.1 Adaptation du thème MUI
- Adapter les couleurs de votre gradient (#667eea, #764ba2) au thème MUI
- Configurer src/@core/theme/colorSchemes.ts
- Créer un thème cohérent

8.2 Composants personnalisés
- Recréer vos composants partagés en MUI
- Utiliser les composants du template quand possible

Phase 9️⃣ : Tests & Validatio

9.1 Tests fonctionnels
- Tester l'authentification admin/superadmin
- Tester le changement de tenant
- Tester le routing dynamique
- Tester toutes les permissions

9.2 Tests UI
- Vérifier tous les formulaires
- Tester la responsivité
- Vérifier les traductions

9.3 Tests d'intégration
- Tester l'intégration avec l'API Laravel
- Vérifier les headers (X-Tenant-ID, Authorization)
- Tester le multi-tenancy complet

Phase 🔟 : Nettoyage & Documentation

10.1 Nettoyage
- Supprimer les composants du template non utilisés
- Nettoyer les dépendances inutiles
- Optimiser les imports

10.2 Documentation
- Mettre à jour CLAUDE.md avec votre architecture
- Documenter le système multi-tenant
- Documenter le routing dynamique

Ordre d'exécution recommandé

1. Phase 1 (Infrastructure)
2. Phase 2 (Contextes & API)
3. Phase 4 (Auth en premier - critique)
4. Phase 3 (Routing)
5. Phase 6 (Navigation)
6. Phase 5 (Conversion composants - le plus long)
7. Phase 7 (i18n)
8. Phase 8 (Styling)
9. Phase 9 (Tests)
10. Phase 10 (Nettoyage)

Estimation

- Durée totale : 3-5 jours de travail
- Complexité : Élevée (conversion complète Tailwind → MUI)
- Risques : Incompatibilités styling, logique auth complexe

Notes importantes

- La conversion Tailwind → MUI sera la partie la plus chronophage
- Le multi-tenancy nécessitera des tests approfondis
- L'intégration NextAuth + votre système existant peut nécessiter des ajustements
