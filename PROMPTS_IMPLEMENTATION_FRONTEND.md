# Prompts d'Implémentation Frontend - Module SuperAdmin

**Date:** 2026-01-29
**Projet:** iCall26 - Module SuperAdmin Frontend
**Stack:** Next.js 15 + Material-UI 6 + TypeScript

---

## 📌 Comment Utiliser ce Document

Ce document contient **des prompts d'implémentation détaillés** pour chaque story nécessitant une interface frontend.

**Pour chaque story, vous trouverez:**
1. ✅ **User Story** - Le contexte fonctionnel
2. 🎯 **Objectif Frontend** - Ce qui doit être créé
3. 📝 **Prompt d'Implémentation** - Instructions détaillées pas à pas

**Ordre d'implémentation recommandé:**
- Suivez l'ordre des epics (2 → 3 → 4 → 5 → 6)
- Chaque story s'appuie sur les précédentes
- Les fondations (types, services) sont créées d'abord

---

# Epic 2: Découverte et Navigation des Modules

---

## Story 2.1: Service ModuleDiscovery - Liste Modules

### ✅ User Story
As a **SuperAdmin**,
I want **un service frontend pour récupérer la liste des modules**,
So that **je peux afficher les modules dans l'interface**.

### 🎯 Objectif Frontend
Créer le service API et les types TypeScript pour gérer les modules.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Tu travailles sur le module SuperAdmin d'une application Next.js 15 multi-tenant.
Le backend Laravel expose l'API suivante: GET /api/superadmin/modules

TÂCHE:
Créer la couche de service et les types TypeScript pour gérer les modules.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/types/module.types.ts
   - Type Module avec les propriétés:
     * name: string (nom technique du module)
     * displayName: string (nom affiché)
     * description: string
     * version: string
     * enabled: boolean (activé globalement)
     * category: ModuleCategory (enum: 'core' | 'business' | 'integration' | 'ui' | 'utility')
     * icon?: string (optionnel)
     * dependencies: string[] (liste des modules requis)
     * dependents: string[] (modules qui dépendent de celui-ci)
     * path: string (chemin du module)
     * hasConfig: boolean
     * hasMigrations: boolean
     * hasSeeds: boolean

   - Type ModuleCategory (enum)

   - Type ApiResponse<T> générique pour les réponses API

2. src/modules/SuperAdmin/superadmin/services/moduleService.ts
   - Classe ModuleService avec méthode:
     * async getAvailableModules(): Promise<Module[]>
       - Utilise createApiClient() de @/shared/lib/api-client
       - Endpoint: GET /api/superadmin/modules
       - Gère les erreurs avec try/catch
       - Retourne les modules ou [] en cas d'erreur

   - Exporter une instance: export const moduleService = new ModuleService()

3. src/modules/SuperAdmin/index.ts
   - Exporter tous les types: export type { Module, ModuleCategory } from './types/module.types'
   - Exporter le service: export { moduleService } from './superadmin/services/moduleService'

CONTRAINTES:
- Utiliser TypeScript strict
- Suivre les conventions de nommage camelCase pour les propriétés (API retourne camelCase)
- Ajouter JSDoc pour documenter les méthodes
- Gérer les cas d'erreur proprement

VALIDATION:
- Le service peut être importé avec: import { moduleService } from '@/modules/SuperAdmin'
- Les types peuvent être utilisés avec: import type { Module } from '@/modules/SuperAdmin'
```

---

## Story 2.2: API Liste Modules Disponibles - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **voir la liste de tous les modules disponibles dans une interface**,
So that **je peux découvrir et gérer les modules du système**.

### 🎯 Objectif Frontend
Créer la page de liste des modules avec tableau, recherche et filtres.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Tu as déjà créé les types et services pour les modules (story 2.1).
Tu dois maintenant créer une page complète pour afficher la liste des modules.

TÂCHE:
Créer une page Next.js avec tableau de modules, recherche et filtres.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/superadmin/hooks/useModules.ts
   - Hook personnalisé useModules()
   - State: modules (Module[]), loading (boolean), error (Error | null)
   - Utilise moduleService.getAvailableModules() dans useEffect
   - Retourne: { modules, loading, error, refresh }
   - Fonction refresh pour recharger les données

2. src/modules/SuperAdmin/superadmin/components/modules/ModuleCard.tsx
   - Composant client ('use client')
   - Props: module (Module), onViewDetails (callback)
   - Affiche:
     * Avatar avec icône (ou première lettre du nom si pas d'icône)
     * displayName en titre
     * description (tronquée à 100 caractères)
     * Badge pour category (Chip MUI)
     * Badge pour enabled (vert si true, gris si false)
     * version
     * Nombre de dépendances (ex: "3 dépendances")
   - Actions:
     * Bouton "Voir détails" → onViewDetails
   - Utilise Material-UI: Card, CardContent, Typography, Chip, Avatar, Button

3. src/modules/SuperAdmin/superadmin/components/modules/ModulesTable.tsx
   - Composant client ('use client')
   - Props: modules (Module[]), loading (boolean), onViewDetails (callback)
   - Utilise DataTable existant de @/components/shared/DataTable
   - Colonnes:
     * Nom (displayName + icône)
     * Catégorie (Chip coloré)
     * Version
     * Statut (enabled/disabled)
     * Dépendances (nombre)
     * Actions (bouton voir détails)
   - Features:
     * Pagination
     * Recherche (placeholder: "Rechercher un module...")
     * Tri par colonnes
     * Loading state
     * Empty state: "Aucun module trouvé"

4. src/app/[lang]/(dashboard)/(private)/superadmin/modules/page.tsx
   - Page Next.js (Server Component wrapper)
   - Utilise le layout dashboard existant
   - Import du composant client ModulesPage

5. src/modules/SuperAdmin/superadmin/components/modules/ModulesPage.tsx
   - Composant client ('use client')
   - Utilise useModules() hook
   - Layout:
     * PageHeader avec titre "Gestion des Modules" et description
     * Tabs MUI: "Vue Grille" | "Vue Tableau"
     * Recherche et filtres:
       - TextField pour recherche (debounced)
       - Select pour catégorie (toutes | core | business | etc.)
       - Select pour statut (tous | activés | désactivés)
     * Contenu basé sur le tab sélectionné:
       - Grille: Grid MUI avec ModuleCard
       - Tableau: ModulesTable
     * Loading: Skeleton MUI
     * Error: Alert MUI
   - État local: searchTerm, selectedCategory, selectedStatus, viewMode
   - Filtrage côté client des modules basé sur les filtres

6. src/data/navigation/verticalMenuData.tsx
   - Ajouter l'entrée de menu:
     * label: 'Modules'
     * href: '/superadmin/modules'
     * icon: emoji ou iconify icon
     * Sous le groupe SuperAdmin

COMPOSANTS MUI À UTILISER:
- Card, CardContent, CardActions
- Typography (h4, h6, body1, body2)
- Chip (pour badges)
- Avatar
- Button, IconButton
- TextField (recherche)
- Select, MenuItem (filtres)
- Tabs, Tab
- Grid (pour la grille)
- Skeleton (loading)
- Alert (erreurs)
- Box, Stack (layout)

CONTRAINTES:
- Mobile responsive (Grid xs/sm/md/lg)
- Recherche debounced (500ms)
- Filtres multiples cumulables
- Loading states pour meilleure UX
- Gestion des erreurs avec retry
- Tous les textes en français
- Accessibilité: labels ARIA, keyboard navigation

VALIDATION:
- La page est accessible à /superadmin/modules
- La recherche filtre les modules en temps réel
- Les filtres par catégorie et statut fonctionnent
- Changement de vue grille/tableau smooth
- Loading state s'affiche pendant le chargement
```

---

## Story 2.3: Service ModuleDiscovery - Modules Tenant

### ✅ User Story
As a **SuperAdmin**,
I want **récupérer les modules d'un tenant spécifique**,
So that **je peux voir quels modules sont activés pour chaque site**.

### 🎯 Objectif Frontend
Étendre le service pour gérer les modules par tenant.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Tu as déjà le service moduleService et les types de base.
Le backend expose: GET /api/superadmin/sites/{id}/modules

TÂCHE:
Étendre les types et le service pour gérer les modules par tenant.

FICHIERS À MODIFIER/CRÉER:

1. src/modules/SuperAdmin/types/module.types.ts (MODIFIER)
   - Ajouter type TenantModuleStatus:
     * isActive: boolean
     * installedAt: string | null
     * config: Record<string, any>

   - Ajouter type TenantModule extends Module:
     * tenantStatus: TenantModuleStatus
     * Hérite de toutes les propriétés de Module

2. src/modules/SuperAdmin/superadmin/services/moduleService.ts (MODIFIER)
   - Ajouter méthode:
     * async getTenantModules(tenantId: number): Promise<TenantModule[]>
       - Endpoint: GET /api/superadmin/sites/${tenantId}/modules
       - Retourne la liste des modules avec leur statut pour le tenant
       - Gère les erreurs

3. src/modules/SuperAdmin/superadmin/hooks/useTenantModules.ts (CRÉER)
   - Hook useTenantModules(tenantId: number)
   - State: modules, loading, error
   - Appelle moduleService.getTenantModules(tenantId)
   - Se recharge si tenantId change
   - Retourne: { modules, loading, error, refresh }

4. src/modules/SuperAdmin/index.ts (MODIFIER)
   - Exporter les nouveaux types: TenantModule, TenantModuleStatus
   - Exporter le nouveau hook: useTenantModules

CONTRAINTES:
- TenantModule doit inclure TOUS les modules (actifs et inactifs)
- Le statut tenantStatus indique si activé pour ce tenant
- Gérer le cas où tenantId est invalide
- Cache les données pour éviter trop d'appels API

VALIDATION:
- useTenantModules retourne modules avec statut tenant
- Un module inactif a isActive: false
- Un module actif a installedAt non null
```

---

## Story 2.4: API Modules par Tenant - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **voir les modules d'un tenant dans l'interface du site**,
So that **je peux gérer les modules spécifiques à chaque tenant**.

### 🎯 Objectif Frontend
Créer une page intégrée à la gestion des sites pour afficher/gérer les modules d'un tenant.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Tu as déjà les hooks useTenantModules et les types TenantModule.
Tu dois créer une page accessible depuis la vue détail d'un site.

TÂCHE:
Créer une page/onglet "Modules" dans la gestion d'un site.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/superadmin/components/modules/TenantModuleCard.tsx
   - Similar à ModuleCard mais adapté pour tenant
   - Props: module (TenantModule), onActivate, onDeactivate, onConfigure
   - Affiche:
     * Toutes les infos de ModuleCard
     * Badge de statut tenant: "Actif" (vert) ou "Disponible" (gris)
     * Si actif: date d'installation (installedAt formatée)
     * Si actif: indication "Configuré" si config non vide
   - Actions conditionnelles:
     * Si inactif: Bouton "Activer" → onActivate
     * Si actif: Bouton "Désactiver" (rouge) → onDeactivate
     * Si actif ET hasConfig: Bouton "Configurer" → onConfigure

2. src/modules/SuperAdmin/superadmin/components/modules/TenantModulesView.tsx
   - Composant client
   - Props: tenantId (number), tenantName (string)
   - Utilise useTenantModules(tenantId)
   - Layout en 2 sections:
     * Section "Modules Actifs" (isActive: true)
       - Grille de TenantModuleCard
       - Affiche le nombre total
       - Message si aucun: "Aucun module activé"
     * Section "Modules Disponibles" (isActive: false)
       - Grille de TenantModuleCard
       - Affiche le nombre total
   - Recherche globale (filtre les deux sections)
   - Actions:
     * onActivate: Ouvre le modal d'activation (story 3.6)
     * onDeactivate: Ouvre le modal de désactivation (story 4.7)
     * onConfigure: Ouvre drawer de configuration

3. src/app/[lang]/(dashboard)/(private)/superadmin/sites/[id]/modules/page.tsx
   - Page Next.js
   - Récupère l'ID du site depuis params
   - Récupère les infos du site (nom, domaine) depuis API ou cache
   - Affiche TenantModulesView avec tenantId et tenantName

4. src/modules/Site/superadmin/components/SiteDetailTabs.tsx (MODIFIER si existe)
   - Ajouter un onglet "Modules"
   - Affiche TenantModulesView dans le contenu de l'onglet

OU (si tabs n'existe pas encore)

4. Créer navigation vers modules depuis la page détail site
   - Lien/bouton "Gérer les modules" dans la page site detail
   - Route vers /superadmin/sites/[id]/modules

5. src/data/navigation/verticalMenuData.tsx (MODIFIER)
   - L'entrée modules est déjà là
   - S'assurer que la route dynamique fonctionne

INTERACTIONS:
- Click "Activer" → Placeholder toast "Activation à venir (story 3.6)"
- Click "Désactiver" → Placeholder toast "Désactivation à venir (story 4.7)"
- Click "Configurer" → Placeholder toast "Configuration à venir"

CONTRAINTES:
- Les placeholders seront remplacés dans les stories suivantes
- Séparer clairement modules actifs et disponibles
- Afficher un compteur pour chaque section
- Recherche filtre les deux sections simultanément
- Format de date: "il y a X jours/mois" (date-fns avec locale fr)

VALIDATION:
- Page accessible à /superadmin/sites/123/modules
- Affiche les modules actifs séparément des disponibles
- Recherche fonctionne sur les deux sections
- Les boutons d'action sont conditionnels selon le statut
```

---

## Story 2.5: Filtrage et Recherche Modules - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **filtrer et rechercher les modules facilement**,
So that **je peux trouver rapidement le module dont j'ai besoin**.

### 🎯 Objectif Frontend
Améliorer les filtres et la recherche des pages modules existantes.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Tu as déjà les pages de modules (story 2.2 et 2.4) avec recherche basique.
Tu dois améliorer les capacités de filtrage.

TÂCHE:
Ajouter des filtres avancés et améliorer la recherche.

FICHIERS À MODIFIER:

1. src/modules/SuperAdmin/superadmin/components/modules/ModuleFilters.tsx (CRÉER)
   - Composant client réutilisable
   - Props:
     * onFilterChange: (filters: ModuleFilters) => void
     * showTenantFilter?: boolean (optionnel, pour page tenant)

   - Interface ModuleFilters:
     * search: string
     * category: ModuleCategory | 'all'
     * status: 'all' | 'enabled' | 'disabled'
     * tenantStatus?: 'all' | 'active' | 'available' (si showTenantFilter)
     * hasDependencies: 'all' | 'yes' | 'no'

   - UI:
     * TextField recherche avec icône et debounce 300ms
     * Select catégorie (avec option "Toutes les catégories")
     * Select statut global
     * Select statut tenant (si showTenantFilter)
     * Checkbox "A des dépendances"
     * Bouton "Réinitialiser les filtres"

   - Layout: Stack horizontal (wrap sur mobile) avec spacing

2. src/modules/SuperAdmin/superadmin/components/modules/ModulesPage.tsx (MODIFIER)
   - Remplacer les filtres existants par ModuleFilters
   - State: filters (ModuleFilters)
   - Fonction filterModules(modules, filters) qui applique tous les filtres
   - Afficher le nombre de résultats: "X modules trouvés"

3. src/modules/SuperAdmin/superadmin/components/modules/TenantModulesView.tsx (MODIFIER)
   - Ajouter ModuleFilters avec showTenantFilter={true}
   - Filtrage unifié des modules actifs et disponibles
   - Afficher "X modules actifs, Y disponibles" après filtrage

4. src/modules/SuperAdmin/superadmin/utils/moduleFilters.ts (CRÉER)
   - Fonction utilitaire: filterModules(modules: Module[] | TenantModule[], filters: ModuleFilters)
   - Logique de filtrage:
     * search: filtre sur name, displayName, description (insensible à la casse)
     * category: filtre exact (sauf 'all')
     * status: filtre sur enabled
     * tenantStatus: filtre sur tenantStatus.isActive (si TenantModule)
     * hasDependencies: filtre si dependencies.length > 0
   - Retourne: Module[] ou TenantModule[] filtrés

AMÉLIORATIONS UX:
- Afficher un indicateur de filtres actifs (badge sur bouton filtres)
- Conserver les filtres dans URL query params (useSearchParams)
- Restaurer les filtres depuis URL au chargement
- Animation smooth lors du changement de filtres

CONTRAINTES:
- Tous les filtres sont cumulables (AND logic)
- La recherche est insensible à la casse et aux accents
- Debounce sur la recherche pour éviter trop de re-renders
- Performance: memoization avec useMemo

VALIDATION:
- Recherche "mail" trouve le module Mail
- Filtre catégorie "core" affiche seulement les modules core
- Combinaison de filtres fonctionne correctement
- URL reflète les filtres actifs
- Bouton reset efface tous les filtres
```

---

## Story 2.6: Service ModuleDependencyResolver

### ✅ User Story
As a **SuperAdmin**,
I want **résoudre automatiquement les dépendances des modules**,
So that **je sais quels modules doivent être activés ensemble**.

### 🎯 Objectif Frontend
Créer un service et des types pour gérer les dépendances.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Le backend fournit un endpoint pour résoudre les dépendances.
API: POST /api/superadmin/modules/resolve-dependencies
Body: { modules: string[] }

TÂCHE:
Créer le service et les types pour la résolution de dépendances.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/types/dependency.types.ts
   - Type DependencyNode:
     * id: string (nom du module)
     * label: string (displayName)
     * type: 'module' | 'external'
     * status: 'active' | 'inactive' | 'missing'
     * required: boolean

   - Type DependencyEdge:
     * from: string (module source)
     * to: string (module dépendance)
     * required: boolean

   - Type DependencyGraph:
     * nodes: DependencyNode[]
     * edges: DependencyEdge[]

   - Type DependencyResolution:
     * canInstall: boolean
     * requiredModules: string[] (modules à installer en plus)
     * missingDependencies: string[] (dépendances non disponibles)
     * installOrder: string[] (ordre d'installation recommandé)

2. src/modules/SuperAdmin/superadmin/services/dependencyService.ts
   - Classe DependencyService avec méthodes:

     * async resolveDependencies(modules: string[]): Promise<DependencyResolution>
       - POST /api/superadmin/modules/resolve-dependencies
       - Body: { modules }
       - Retourne la résolution

     * async getDependencyGraph(moduleName: string): Promise<DependencyGraph>
       - GET /api/superadmin/modules/${moduleName}/dependencies/graph
       - Retourne le graphe de dépendances

     * async getDependentModules(moduleName: string): Promise<string[]>
       - GET /api/superadmin/modules/${moduleName}/dependents
       - Retourne les modules qui dépendent de celui-ci

   - Export instance: export const dependencyService = new DependencyService()

3. src/modules/SuperAdmin/index.ts (MODIFIER)
   - Exporter tous les types de dependency
   - Exporter dependencyService

CONTRAINTES:
- Gérer les dépendances circulaires
- Retourner un ordre d'installation topologique
- Identifier clairement les dépendances manquantes
- Cache les résolutions pour éviter appels multiples

VALIDATION:
- resolveDependencies retourne l'ordre correct d'installation
- getDependencyGraph retourne nodes et edges valides
- getDependentModules liste tous les dépendants
```

---

## Story 2.7: API Graph Dépendances - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **visualiser le graphe de dépendances d'un module**,
So that **je comprends les relations entre modules**.

### 🎯 Objectif Frontend
Créer une visualisation graphique des dépendances avec react-flow.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Tu as le service dependencyService qui retourne DependencyGraph.
Tu dois créer une visualisation interactive avec react-flow.

PRÉREQUIS:
- Installer: pnpm add reactflow
- Lire la doc: https://reactflow.dev/

TÂCHE:
Créer un composant de visualisation de graphe de dépendances.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/superadmin/components/dependencies/DependencyGraphView.tsx
   - Composant client
   - Props:
     * moduleName: string
     * onNodeClick?: (moduleId: string) => void

   - Utilise dependencyService.getDependencyGraph(moduleName)
   - Convertit DependencyGraph en format ReactFlow:
     * nodes: DependencyNode[] → Node[] de ReactFlow
       - id: node.id
       - data: { label: node.label, status: node.status }
       - type: 'custom' (utiliser custom node)
       - position: calculée par layout algorithm
     * edges: DependencyEdge[] → Edge[] de ReactFlow
       - id: `${from}-${to}`
       - source: from
       - target: to
       - type: required ? 'solid' : 'dashed'
       - animated: true si required

   - Layout:
     * Utiliser dagre pour auto-layout (direction: TB - top to bottom)
     * Installer: pnpm add dagre @types/dagre

   - Couleurs des nodes selon status:
     * active: vert (#4caf50)
     * inactive: gris (#9e9e9e)
     * missing: rouge (#f44336)

   - Features ReactFlow:
     * Controls (zoom, pan)
     * MiniMap
     * Background (dots)
     * onClick node → callback onNodeClick

2. src/modules/SuperAdmin/superadmin/components/dependencies/CustomDependencyNode.tsx
   - Custom node pour ReactFlow
   - Props: data (avec label, status, required)
   - Affiche:
     * Badge de statut coloré
     * Label du module
     * Icône selon le type
   - Style: Card MUI adapté en node ReactFlow
   - Handle points (source et target)

3. src/modules/SuperAdmin/superadmin/components/modules/ModuleDependenciesModal.tsx
   - Modal qui affiche le graphe
   - Props: moduleName, open, onClose
   - Header: Titre "Dépendances de {moduleName}"
   - Body: DependencyGraphView en pleine largeur
   - Actions:
     * Bouton "Fermer"
     * Bouton "Exporter PNG" (utilise ReactFlow.getNodes/getEdges)
   - Size: fullWidth maxWidth='lg'

4. src/modules/SuperAdmin/superadmin/components/modules/ModuleCard.tsx (MODIFIER)
   - Ajouter bouton "Voir dépendances" (icône graph)
   - State: showDependencies (boolean)
   - Affiche ModuleDependenciesModal si showDependencies

5. src/app/[lang]/(dashboard)/(private)/superadmin/modules/[name]/dependencies/page.tsx
   - Page dédiée pour voir les dépendances
   - Params: name (nom du module)
   - Affiche DependencyGraphView en pleine page
   - Breadcrumbs: Modules > {name} > Dépendances

STYLE REACTFLOW:
```css
/* src/modules/SuperAdmin/superadmin/components/dependencies/dependency-graph.css */
.react-flow__node-custom {
  border-radius: 8px;
  padding: 10px;
  border: 2px solid;
  background: white;
}

.react-flow__node-custom.active {
  border-color: #4caf50;
}

.react-flow__node-custom.inactive {
  border-color: #9e9e9e;
}

.react-flow__node-custom.missing {
  border-color: #f44336;
}
```

CONTRAINTES:
- Auto-layout pour éviter chevauchements
- Performance: memoization pour grandes graphes
- Responsive: adapter la taille selon le viewport
- Export PNG optionnel (react-to-image)

VALIDATION:
- Le graphe affiche correctement les dépendances
- Les couleurs correspondent aux statuts
- Le layout est lisible (pas de chevauchements)
- Click sur node déclenche le callback
- Modal s'ouvre depuis ModuleCard
```

---

## Story 2.8: API Modules Dépendants - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **voir la liste des modules qui dépendent d'un module**,
So that **je sais quels modules seront affectés si je le désactive**.

### 🎯 Objectif Frontend
Ajouter une section "Modules dépendants" dans la vue détail d'un module.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Tu as déjà dependencyService.getDependentModules().
Tu dois afficher cette info dans l'interface.

TÂCHE:
Créer un composant pour afficher les modules dépendants.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/superadmin/hooks/useDependentModules.ts
   - Hook useDependentModules(moduleName: string)
   - Appelle dependencyService.getDependentModules(moduleName)
   - Récupère ensuite les détails de chaque module dépendant
   - Retourne: { dependents: Module[], loading, error }

2. src/modules/SuperAdmin/superadmin/components/dependencies/DependentModulesList.tsx
   - Composant client
   - Props: moduleName (string)
   - Utilise useDependentModules(moduleName)
   - Affiche:
     * Titre: "Modules dépendants ({count})"
     * Si aucun: Message "Aucun module ne dépend de celui-ci"
     * Si présents: Liste avec pour chaque:
       - Nom du module
       - Version
       - Badge "Actif" ou "Inactif"
       - Bouton "Voir détails"
   - Layout: List MUI avec ListItem

3. src/modules/SuperAdmin/superadmin/components/modules/ModuleDetailView.tsx (CRÉER)
   - Composant complet de détails d'un module
   - Props: moduleName (string)
   - Récupère les détails du module (depuis cache ou API)
   - Layout en sections:
     * Header: Nom, version, badges
     * Description complète
     * Informations techniques:
       - Path
       - Catégorie
       - Has config / migrations / seeds
     * Section "Dépendances" (liste des dependencies)
     * Section "Modules dépendants" (DependentModulesList)
     * Section "Graphe" (bouton pour ouvrir le modal)
   - Style: Card MUI avec sections délimitées

4. src/app/[lang]/(dashboard)/(private)/superadmin/modules/[name]/page.tsx
   - Page de détail d'un module
   - Params: name (nom du module)
   - Affiche ModuleDetailView
   - Breadcrumbs: Modules > {name}

5. src/modules/SuperAdmin/superadmin/components/modules/ModulesTable.tsx (MODIFIER)
   - Click sur ligne → Navigate vers /superadmin/modules/[name]
   - Ou bouton "Voir détails" dans actions

AMÉLIORATIONS:
- Highlight si un module dépendant est actif (alerte importante)
- Lien rapide vers chaque module dépendant
- Tooltip avec explication de la dépendance

CONTRAINTES:
- Charger les modules dépendants en parallèle
- Cache les résultats pour éviter appels répétés
- Afficher un warning si beaucoup de dépendants (>10)

VALIDATION:
- La liste affiche tous les modules dépendants
- Click sur un dépendant navigue vers ses détails
- Le compteur est correct
- Page détail module est accessible
```

---

## Story 2.9: Cache Modules Redis - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **un système de cache pour les modules**,
So that **l'interface soit plus rapide et réactive**.

### 🎯 Objectif Frontend
Implémenter un cache côté client avec React Query.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Tu as plusieurs composants qui font des appels API pour les modules.
Tu dois implémenter un cache côté client pour optimiser les performances.

PRÉREQUIS:
- Installer: pnpm add @tanstack/react-query @tanstack/react-query-devtools

TÂCHE:
Implémenter React Query pour le cache des modules.

FICHIERS À CRÉER/MODIFIER:

1. src/providers/QueryProvider.tsx (CRÉER)
   - Client Provider React Query
   - Configuration:
     * staleTime: 5 minutes
     * cacheTime: 10 minutes
     * refetchOnWindowFocus: false
     * retry: 1
   - Wrapper avec QueryClientProvider
   - Ajouter ReactQueryDevtools en dev mode

2. src/app/[lang]/(dashboard)/(private)/layout.tsx (MODIFIER)
   - Wrapper l'app avec QueryProvider

3. src/modules/SuperAdmin/superadmin/hooks/useModules.ts (MODIFIER)
   - Remplacer useState/useEffect par useQuery
   - Query key: ['modules']
   - Query fn: moduleService.getAvailableModules
   - Retourner: { data: modules, isLoading, error, refetch }

4. src/modules/SuperAdmin/superadmin/hooks/useTenantModules.ts (MODIFIER)
   - useQuery avec query key: ['tenant-modules', tenantId]
   - Query fn: () => moduleService.getTenantModules(tenantId)
   - Enabled: tenantId > 0
   - Retourner: { data, isLoading, error, refetch }

5. src/modules/SuperAdmin/superadmin/hooks/useModuleDetails.ts (CRÉER)
   - Hook pour un module spécifique
   - useQuery avec query key: ['module', moduleName]
   - Query fn: () => moduleService.getModuleDetails(moduleName)
   - Retourne: { data: module, isLoading, error }

6. src/modules/SuperAdmin/superadmin/hooks/useDependencyGraph.ts (CRÉER)
   - Hook pour le graphe de dépendances
   - useQuery avec key: ['dependency-graph', moduleName]
   - Query fn: () => dependencyService.getDependencyGraph(moduleName)
   - staleTime: 10 minutes (les dépendances changent rarement)

7. src/modules/SuperAdmin/superadmin/hooks/useDependentModules.ts (MODIFIER)
   - useQuery avec key: ['dependent-modules', moduleName]
   - Query fn: () => dependencyService.getDependentModules(moduleName)
   - Puis useQueries pour récupérer détails de chaque dépendant

MUTATIONS (pour invalider le cache):

8. src/modules/SuperAdmin/superadmin/hooks/useModuleActivation.ts (CRÉER - story 3.6)
   - useMutation pour activation
   - onSuccess: invalider queries ['modules'], ['tenant-modules', tenantId]

9. src/modules/SuperAdmin/superadmin/hooks/useModuleDeactivation.ts (CRÉER - story 4.7)
   - useMutation pour désactivation
   - onSuccess: invalider queries ['modules'], ['tenant-modules', tenantId]

OPTIMISATIONS:
- Prefetch des modules au hover sur carte
- Optimistic updates pour activation/désactivation
- Background refetch toutes les 5 minutes

CONTRAINTES:
- Utiliser le même QueryClient partout
- Keys de cache cohérentes
- Invalider le cache aux bons moments
- Dev tools uniquement en dev

VALIDATION:
- Pas de double appel API lors de navigation
- Cache se rafraîchit après activation/désactivation
- Dev tools affichent les queries correctement
- Performance améliorée (mesurer avec React DevTools)
```

---

# Epic 3: Activation des Modules

---

## Story 3.1 à 3.5: Services Backend (pas d'interface)

Ces stories concernent uniquement les services backend (TenantStorageManager, TenantMigrationRunner, SagaOrchestrator, ModuleInstaller).

**Aucune interface frontend n'est nécessaire** - ces services sont utilisés en coulisses par l'API d'activation (story 3.6).

---

## Story 3.6: API Activation Module - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **activer un module pour un tenant via l'interface**,
So that **je peux gérer les fonctionnalités disponibles pour chaque site**.

### 🎯 Objectif Frontend
Créer un assistant d'activation de module en plusieurs étapes (wizard).

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Le backend expose: POST /api/superadmin/sites/{id}/modules/{module}
Tu dois créer un wizard d'activation multi-étapes avec feedback en temps réel.

TÂCHE:
Créer un assistant d'activation de module complet.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/types/activation.types.ts
   - Type ActivationRequest:
     * tenantId: number
     * moduleName: string
     * config?: Record<string, any>

   - Type SagaStep:
     * name: string
     * status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back'
     * startedAt?: string
     * completedAt?: string
     * error?: string
     * message?: string

   - Type ActivationResult:
     * success: boolean
     * module: string
     * steps: SagaStep[]
     * installedAt?: string
     * error?: string

   - Type ActivationConfig:
     * [key: string]: any (configuration spécifique au module)

2. src/modules/SuperAdmin/superadmin/services/activationService.ts
   - Classe ActivationService avec méthode:
     * async activateModule(request: ActivationRequest): Promise<ActivationResult>
       - POST /api/superadmin/sites/${tenantId}/modules/${moduleName}
       - Body: { config }
       - Retourne le résultat d'activation avec les étapes Saga

3. src/modules/SuperAdmin/superadmin/hooks/useModuleActivation.ts
   - Hook avec useMutation (React Query)
   - Mutation: activationService.activateModule
   - onSuccess: invalider cache ['tenant-modules', tenantId]
   - Retourne: { activate, isActivating, result, error, reset }

4. src/modules/SuperAdmin/superadmin/components/activation/ActivationWizard.tsx
   - Modal wizard en 4 étapes
   - Props:
     * open: boolean
     * onClose: () => void
     * module: TenantModule
     * tenantId: number
     * tenantName: string

   - State:
     * activeStep: number (0-3)
     * dependencies: DependencyResolution | null
     * config: ActivationConfig
     * checkingDeps: boolean

   - STEP 0 - Informations:
     * Affiche les infos du module
     * Nom, version, description
     * Tenant cible
     * Bouton "Suivant"

   - STEP 1 - Vérification dépendances:
     * Automatique au montage du step
     * Appelle dependencyService.resolveDependencies([moduleName])
     * Affiche:
       - ✓ Dépendances installées (vert)
       - ⚠ Dépendances à installer (orange)
       - ✗ Dépendances manquantes (rouge)
     * Checkbox: "Installer automatiquement les dépendances manquantes"
     * Bouton "Suivant" désactivé si dépendances manquantes et non cochée

   - STEP 2 - Configuration (optionnel):
     * Si module.hasConfig === true
     * Formulaire dynamique de configuration
     * Champs selon le module (à définir par module)
     * Sinon: Skip ce step
     * Validation: React Hook Form

   - STEP 3 - Confirmation et Exécution:
     * Récapitulatif:
       - Module à activer
       - Tenant cible
       - Dépendances à installer (si applicable)
       - Configuration (si applicable)
     * Bouton "Confirmer l'activation"
     * Lors du click:
       - Lance useModuleActivation.activate()
       - Affiche les étapes Saga en temps réel
       - Progress bar global
       - Liste des steps avec statut
     * Résultat:
       - Si succès: Message de succès + bouton "Fermer"
       - Si échec: Message d'erreur + détails + bouton "Réessayer"

5. src/modules/SuperAdmin/superadmin/components/activation/SagaStepsList.tsx
   - Affiche les étapes Saga en temps réel
   - Props: steps (SagaStep[])
   - Pour chaque step:
     * Icône selon statut:
       - pending: ⏸ (gris)
       - running: ⏳ (bleu animé)
       - completed: ✓ (vert)
       - failed: ✗ (rouge)
       - rolled_back: ↩ (orange)
     * Nom du step
     * Durée (si completed)
     * Message d'erreur (si failed)
   - Layout: Timeline MUI ou Stepper vertical

6. src/modules/SuperAdmin/superadmin/components/modules/TenantModuleCard.tsx (MODIFIER)
   - Remplacer le placeholder onActivate
   - State: showActivationWizard
   - Affiche ActivationWizard si showActivationWizard

FORMULAIRE DE CONFIGURATION (exemple pour module Commerce):

7. src/modules/SuperAdmin/superadmin/components/activation/configs/CommerceConfig.tsx
   - Composant de formulaire pour config Commerce
   - Champs:
     * currency: Select (EUR, USD, GBP, etc.)
     * paymentMethods: Checkboxes (Card, PayPal, Bank Transfer)
     * taxRate: Number (%)
   - Validation: Yup schema
   - Retourne les valeurs via callback

8. src/modules/SuperAdmin/superadmin/components/activation/ModuleConfigForm.tsx
   - Composant wrapper qui affiche le bon formulaire selon le module
   - Switch sur module.name:
     * 'Commerce' → CommerceConfig
     * 'Mail' → MailConfig (à créer)
     * default → Message "Aucune configuration requise"
   - Props: moduleName, onConfigChange

COMPOSANTS MUI:
- Dialog (modal)
- Stepper (wizard steps)
- StepLabel, StepContent
- LinearProgress (progress bar)
- Timeline ou List (pour saga steps)
- Button, TextField, Select, Checkbox
- Alert (messages de succès/erreur)

CONTRAINTES:
- Ne pas permettre de fermer le modal pendant l'activation
- Afficher un loader sur le bouton "Confirmer" pendant l'activation
- Permettre de revenir en arrière uniquement avant le step 3
- Invalider le cache après activation réussie
- Afficher un toast de succès après fermeture du modal

VALIDATION:
- Le wizard s'ouvre depuis TenantModuleCard
- Les 4 steps s'affichent correctement
- La vérification des dépendances fonctionne
- L'activation appelle l'API et affiche le résultat
- Le cache est invalidé après succès
```

---

## Story 3.7: Rollback Automatique Activation - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **voir les rollbacks automatiques en cas d'échec d'activation**,
So that **je comprends ce qui a été annulé**.

### 🎯 Objectif Frontend
Améliorer l'affichage des résultats d'activation pour montrer les rollbacks.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
L'API retourne les steps Saga avec statut 'rolled_back' en cas d'échec.
Tu dois améliorer l'affichage pour montrer clairement les rollbacks.

TÂCHE:
Améliorer SagaStepsList pour afficher les rollbacks.

FICHIERS À MODIFIER:

1. src/modules/SuperAdmin/superadmin/components/activation/SagaStepsList.tsx
   - Ajouter une section "Rollback" séparée
   - Détecter les steps avec status 'rolled_back'
   - Afficher en 2 colonnes:
     * Colonne gauche: Steps exécutés (completed/failed)
     * Colonne droite: Steps rolled back
   - Flèche visuelle montrant le rollback
   - Message explicatif: "L'activation a échoué. Les modifications suivantes ont été annulées:"

2. src/modules/SuperAdmin/superadmin/components/activation/ActivationWizard.tsx (MODIFIER)
   - Dans le step 3, après échec:
     * Afficher un Alert error avec le message d'erreur principal
     * Afficher SagaStepsList avec les rollbacks
     * Afficher un résumé: "X étapes réussies, Y étapes annulées"
     * Boutons:
       - "Réessayer" → Repart au step 1
       - "Annuler" → Ferme le modal
       - "Voir les logs" → Ouvre un drawer avec logs détaillés (optionnel)

3. src/modules/SuperAdmin/types/activation.types.ts (MODIFIER)
   - Ajouter type RollbackInfo:
     * originalStep: string (nom du step qui a échoué)
     * rolledBackSteps: string[] (steps annulés)
     * reason: string (raison de l'échec)

AMÉLIORATIONS:
- Code couleur pour rollbacks (orange)
- Animation montrant le rollback (inverse de la progression)
- Tooltip avec détails du rollback au hover

VALIDATION:
- Les rollbacks sont clairement visibles
- L'utilisateur comprend ce qui a été annulé
- Possibilité de réessayer facilement
```

---

## Story 3.8: Rapport Détaillé Activation - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **un rapport détaillé après chaque activation**,
So that **je peux vérifier que tout s'est bien passé**.

### 🎯 Objectif Frontend
Créer un composant de rapport d'activation détaillé.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Après une activation (succès ou échec), afficher un rapport complet.

TÂCHE:
Créer un composant de rapport d'activation.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/superadmin/components/activation/ActivationReport.tsx
   - Props: result (ActivationResult)
   - Layout en sections:

     * Header:
       - Icône de statut (✓ succès ou ✗ échec)
       - Titre: "Activation réussie" ou "Activation échouée"
       - Module et tenant
       - Date et heure

     * Section "Résumé":
       - Durée totale de l'activation
       - Nombre d'étapes: X réussies, Y échouées
       - Date d'installation (si succès)

     * Section "Détails des étapes":
       - SagaStepsList amélioré
       - Temps d'exécution par étape
       - Messages détaillés

     * Section "Dépendances installées" (si applicable):
       - Liste des modules installés automatiquement
       - Versions installées

     * Section "Configuration appliquée" (si applicable):
       - Affichage de la config (masquer les secrets)

     * Section "Fichiers créés" (optionnel):
       - Migrations exécutées
       - Assets publiés
       - Fichiers de config créés

     * Actions:
       - Bouton "Télécharger le rapport" (export en PDF ou JSON)
       - Bouton "Voir dans l'audit trail"
       - Bouton "Fermer"

2. src/modules/SuperAdmin/superadmin/components/activation/ActivationWizard.tsx (MODIFIER)
   - Dans le step 3, après résultat (succès ou échec):
     * Afficher ActivationReport au lieu de juste SagaStepsList
     * Garder le modal ouvert pour permettre de voir le rapport
     * Bouton "Fermer" pour fermer le modal

3. src/modules/SuperAdmin/superadmin/utils/reportExport.ts (CRÉER)
   - Fonction exportActivationReport(result: ActivationResult, format: 'json' | 'pdf')
   - JSON: Créer un Blob avec JSON.stringify(result, null, 2)
   - PDF: Utiliser jsPDF ou html2pdf pour générer PDF
     * Installer: pnpm add jspdf
   - Télécharger le fichier: activation-report-{module}-{date}.{format}

MISE EN PAGE:
- Utiliser MUI Paper pour chaque section
- Divider entre les sections
- Typography pour les titres (h6)
- Accordion pour sections collapseables (optionnel)

CONTRAINTES:
- Format lisible et professionnel
- Masquer les informations sensibles (secrets, passwords)
- Exporter seulement les données pertinentes
- Performance: ne pas bloquer l'UI lors de l'export PDF

VALIDATION:
- Le rapport affiche toutes les infos importantes
- Export JSON fonctionne
- Export PDF génère un document lisible
- Le rapport est accessible après succès ET échec
```

---

## Story 3.9: Activation Batch Modules - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **activer plusieurs modules en une seule fois**,
So that **je gagne du temps lors de la configuration d'un nouveau tenant**.

### 🎯 Objectif Frontend
Créer une interface d'activation par lot (batch).

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Le backend expose: POST /api/superadmin/modules/batch-activate
Body: { activations: [{ tenantId, moduleName, config }] }

TÂCHE:
Créer une interface d'activation par lot.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/types/activation.types.ts (MODIFIER)
   - Type BatchActivationRequest:
     * activations: ActivationRequest[]

   - Type BatchActivationResult:
     * total: number
     * successful: number
     * failed: number
     * results: {
       tenantId: number
       module: string
       success: boolean
       error?: string
       installedAt?: string
     }[]

2. src/modules/SuperAdmin/superadmin/services/activationService.ts (MODIFIER)
   - Ajouter méthode:
     * async batchActivate(request: BatchActivationRequest): Promise<BatchActivationResult>

3. src/modules/SuperAdmin/superadmin/hooks/useBatchActivation.ts (CRÉER)
   - Hook avec useMutation
   - onSuccess: invalider cache de tous les tenants affectés

4. src/modules/SuperAdmin/superadmin/components/activation/BatchActivationWizard.tsx
   - Modal wizard en 3 étapes
   - Props:
     * open: boolean
     * onClose: () => void
     * initialTenantId?: number (optionnel, pour pré-sélectionner)

   - STEP 0 - Sélection tenant(s) et module(s):
     * Autocomplete multi-select pour tenants
       - Recherche par nom/domaine
       - Affiche: domaine + company
     * Autocomplete multi-select pour modules
       - Recherche par nom
       - Affiche: displayName + version
     * Validation: Au moins 1 tenant et 1 module

   - STEP 1 - Vérification dépendances:
     * Pour chaque combinaison tenant/module:
       - Vérifier si déjà actif
       - Vérifier les dépendances
     * Afficher un tableau:
       | Tenant | Module | Statut | Dépendances |
       | ------ | ------ | ------ | ----------- |
       | site1  | Mail   | ✓ Prêt | -           |
       | site1  | Commerce | ⚠ Dépendances | Payment |
       | site2  | Mail   | ⊘ Déjà actif | -       |
     * Options:
       - ☑ Installer automatiquement les dépendances
       - ☑ Ignorer les modules déjà actifs

   - STEP 2 - Exécution:
     * Lancer batchActivate
     * Afficher une liste avec progression par activation:
       - Tenant + Module
       - Progress bar individuelle
       - Statut: En attente | En cours | Réussi | Échoué
     * Progress bar globale
     * Résultat final:
       - X/Y activations réussies
       - Liste des échecs avec raisons

5. src/modules/SuperAdmin/superadmin/components/activation/BatchActivationProgress.tsx
   - Affiche la progression de chaque activation
   - Props: results (BatchActivationResult | null), inProgress: boolean
   - Liste avec pour chaque activation:
     * Tenant + Module
     * Statut (icône colorée)
     * Message d'erreur (si échec)
   - Résumé en haut: "X/Y réussies"

6. src/app/[lang]/(dashboard)/(private)/superadmin/modules/batch-activate/page.tsx
   - Page dédiée pour activation par lot
   - Affiche BatchActivationWizard en mode page (pas modal)
   - Breadcrumbs: Modules > Activation par lot

7. src/modules/SuperAdmin/superadmin/components/modules/TenantModulesView.tsx (MODIFIER)
   - Ajouter bouton "Activer en lot" dans le header
   - Ouvre BatchActivationWizard avec tenantId pré-sélectionné

8. src/data/navigation/verticalMenuData.tsx (MODIFIER)
   - Ajouter sous-menu "Activation par lot" sous Modules

OPTIMISATIONS:
- Exécuter les activations en parallèle (backend gère)
- Permettre d'annuler les activations en attente
- Exporter le rapport de batch (JSON/CSV)

CONTRAINTES:
- Maximum 50 activations par batch (validation)
- Désactiver les combinaisons invalides (déjà actif)
- Timeout adapté pour batch (5 min)

VALIDATION:
- Le wizard permet de sélectionner multiple tenants/modules
- La vérification détecte les problèmes avant exécution
- Le batch s'exécute et affiche les résultats
- Les succès et échecs sont clairement distingués
```

---

## Story 3.10: Audit Trail Activation - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **voir l'historique de toutes les activations**,
So that **je peux auditer les changements sur les tenants**.

### 🎯 Objectif Frontend
Créer une page d'audit trail avec filtres et export.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Le backend expose: GET /api/superadmin/audit/activations
Query params: tenantId, moduleName, userId, startDate, endDate, page, perPage

TÂCHE:
Créer une page d'audit trail pour les activations/désactivations.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/types/audit.types.ts
   - Type AuditAction:
     * id: number
     * userId: number
     * userName: string
     * action: AuditActionType ('module.activated' | 'module.deactivated' | 'batch.activated')
     * tenantId: number
     * tenantName: string
     * moduleName: string
     * metadata?: {
       success: boolean
       duration?: number
       error?: string
       config?: Record<string, any>
     }
     * createdAt: string

   - Type AuditFilter:
     * tenantId?: number
     * moduleName?: string
     * userId?: number
     * action?: AuditActionType
     * startDate?: string
     * endDate?: string
     * page: number
     * perPage: number

2. src/modules/SuperAdmin/superadmin/services/auditService.ts
   - Classe AuditService avec méthodes:
     * async getAuditLog(filter: AuditFilter): Promise<{ data: AuditAction[], total: number }>
     * async exportAuditLog(filter: AuditFilter, format: 'csv' | 'json'): Promise<Blob>

3. src/modules/SuperAdmin/superadmin/hooks/useAuditLog.ts
   - Hook avec useQuery
   - Query key: ['audit-log', filter]
   - Retourne: { actions, total, isLoading, error }

4. src/modules/SuperAdmin/superadmin/components/audit/AuditFilters.tsx
   - Composant de filtres
   - Champs:
     * Autocomplete tenant (recherche)
     * Autocomplete module (recherche)
     * Select action type
     * DateRangePicker (startDate, endDate)
       - Installer: pnpm add @mui/x-date-pickers
     * Bouton "Réinitialiser"
   - Layout: Stack horizontal avec wrap

5. src/modules/SuperAdmin/superadmin/components/audit/AuditTimeline.tsx
   - Affichage timeline des actions
   - Props: actions (AuditAction[])
   - Utilise Timeline MUI
   - Pour chaque action:
     * Dot coloré selon action (vert=activated, rouge=deactivated)
     * Temps relatif (il y a X minutes/heures/jours)
     * Message: "{userName} a {action} le module {moduleName} sur {tenantName}"
     * Badge success/failure
     * Bouton "Voir détails" → Drawer avec metadata
   - Layout: TimelineItem par action

6. src/modules/SuperAdmin/superadmin/components/audit/AuditDetailDrawer.tsx
   - Drawer qui affiche les détails d'une action
   - Props: action (AuditAction | null), open, onClose
   - Sections:
     * Informations générales
     * Utilisateur
     * Tenant et module
     * Métadonnées (JSON formaté)
     * Configuration appliquée (si présente)
     * Durée de l'opération
     * Erreur (si échec)

7. src/app/[lang]/(dashboard)/(private)/superadmin/audit/activations/page.tsx
   - Page d'audit trail
   - Layout:
     * Header avec titre et actions:
       - Bouton "Exporter CSV"
       - Bouton "Exporter JSON"
     * AuditFilters
     * AuditTimeline
     * Pagination en bas
   - State: filter, selectedAction
   - AuditDetailDrawer pour action sélectionnée

8. src/data/navigation/verticalMenuData.tsx (MODIFIER)
   - Ajouter "Audit" sous Sécurité
   - Sous-menu "Activations de modules"

EXPORT:

9. src/modules/SuperAdmin/superadmin/utils/auditExport.ts
   - Fonction exportAuditLog(actions: AuditAction[], format: 'csv' | 'json')
   - CSV:
     * Colonnes: Date, Utilisateur, Action, Tenant, Module, Succès, Durée
     * Utiliser papaparse: pnpm add papaparse @types/papaparse
   - JSON:
     * JSON.stringify avec indentation

CONTRAINTES:
- Pagination côté serveur (ne pas charger tout l'historique)
- Filtres debounced pour éviter trop de requêtes
- Export limité à 10000 lignes (warning si plus)
- Format de date: ISO 8601 pour export, relatif pour affichage

VALIDATION:
- La timeline affiche l'historique
- Les filtres fonctionnent correctement
- Export CSV et JSON génèrent des fichiers valides
- Le drawer affiche tous les détails
- Pagination fonctionne
```

---

# Epic 4: Désactivation des Modules

---

## Story 4.1 à 4.4: Services Backend (pas d'interface)

Ces stories concernent les services backend pour la désactivation.

**Aucune interface frontend nécessaire** - utilisés par l'API de désactivation (story 4.7).

---

## Story 4.5: API Analyse Impact Désactivation - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **analyser l'impact d'une désactivation avant de confirmer**,
So that **je comprends les conséquences**.

### 🎯 Objectif Frontend
Créer un composant d'analyse d'impact pré-désactivation.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Le backend expose: GET /api/superadmin/sites/{id}/modules/{module}/impact
Tu dois afficher cette analyse avant toute désactivation.

TÂCHE:
Créer un composant d'analyse d'impact.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/types/deactivation.types.ts
   - Type ImpactAnalysis:
     * canDeactivate: boolean
     * blockers: string[] (modules qui EMPÊCHENT la désactivation)
     * warnings: string[] (avertissements non-bloquants)
     * affectedData: {
       tables: string[]
       estimatedRows: number
     }
     * dependentModules: string[] (modules qui seront affectés)
     * recommendations: string[] (actions recommandées)

   - Type DeactivationOptions:
     * backup: boolean (créer un backup S3)
     * force: boolean (forcer malgré les blockers)

   - Type DeactivationRequest:
     * tenantId: number
     * moduleName: string
     * options: DeactivationOptions

   - Type DeactivationResult:
     * success: boolean
     * module: string
     * backupPath?: string
     * steps: SagaStep[] (réutiliser de activation.types)
     * error?: string

2. src/modules/SuperAdmin/superadmin/services/deactivationService.ts
   - Classe DeactivationService avec méthodes:
     * async analyzeImpact(tenantId: number, moduleName: string): Promise<ImpactAnalysis>
     * async deactivateModule(request: DeactivationRequest): Promise<DeactivationResult>

3. src/modules/SuperAdmin/superadmin/hooks/useDeactivationImpact.ts
   - Hook avec useQuery
   - Query key: ['deactivation-impact', tenantId, moduleName]
   - Enabled: false (manuel trigger)
   - Retourne: { impact, isLoading, refetch }

4. src/modules/SuperAdmin/superadmin/components/deactivation/ImpactAnalysisView.tsx
   - Composant d'affichage de l'analyse
   - Props: impact (ImpactAnalysis)
   - Layout en sections:

     * Header:
       - Icône selon canDeactivate:
         * true: ⚠ (orange) "Désactivation possible avec avertissements"
         * false: 🛑 (rouge) "Désactivation bloquée"

     * Section "Blockers" (si présents):
       - Liste rouge des modules bloquants
       - Message: "Ces modules dépendent de celui-ci et doivent être désactivés d'abord"
       - Liens vers chaque module bloquant

     * Section "Modules Dépendants" (si présents):
       - Liste orange des modules affectés
       - Message: "Ces modules seront affectés mais ne bloquent pas la désactivation"

     * Section "Données Affectées":
       - Nombre de tables: X
       - Nombre estimé de lignes: Y
       - Warning: "Ces données seront supprimées ou archivées"

     * Section "Avertissements":
       - Liste des warnings
       - Icônes selon la sévérité

     * Section "Recommandations":
       - Liste des actions recommandées
       - Ex: "Créer un backup avant désactivation"

5. src/modules/SuperAdmin/superadmin/components/deactivation/DeactivationConfirmDialog.tsx
   - Dialog de confirmation avant désactivation
   - Props:
     * open: boolean
     * onClose: () => void
     * impact: ImpactAnalysis
     * module: TenantModule
     * tenantId: number
     * onConfirm: (options: DeactivationOptions) => void

   - Contenu:
     * Affiche ImpactAnalysisView
     * Formulaire d'options:
       - Checkbox "Créer un backup S3 avant désactivation" (checked par défaut)
       - Checkbox "Forcer la désactivation" (uniquement si blockers, disabled avec tooltip explicatif)
     * Champ de confirmation:
       - TextField: "Tapez 'CONFIRMER' pour valider"
       - Désactive le bouton "Désactiver" tant que non tapé
     * Actions:
       - Bouton "Annuler"
       - Bouton "Désactiver" (rouge, disabled si blockers OU confirmation non tapée)

6. src/modules/SuperAdmin/superadmin/components/modules/TenantModuleCard.tsx (MODIFIER)
   - Click sur "Désactiver":
     * State: showImpactAnalysis, impact
     * Appelle useDeactivationImpact.refetch()
     * Affiche DeactivationConfirmDialog avec impact
   - Callback onConfirm:
     * Lance la désactivation (story 4.7)

CONTRAINTES:
- Bloquer la désactivation si blockers présents ET force non coché
- Recommander TOUJOURS le backup
- Afficher clairement les conséquences
- Utiliser des couleurs pour les niveaux de sévérité

VALIDATION:
- L'analyse d'impact se charge correctement
- Les blockers empêchent la désactivation
- Le champ de confirmation fonctionne
- Les options sont correctement passées à l'API
```

---

## Story 4.6: Service ModuleInstaller - Désactivation (pas d'interface)

Backend uniquement.

---

## Story 4.7: API Désactivation Module - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **désactiver un module pour un tenant**,
So that **je peux retirer des fonctionnalités non utilisées**.

### 🎯 Objectif Frontend
Implémenter la désactivation complète avec feedback.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Tu as déjà DeactivationConfirmDialog (story 4.5).
Le backend expose: DELETE /api/superadmin/sites/{id}/modules/{module}

TÂCHE:
Compléter le workflow de désactivation.

FICHIERS À MODIFIER/CRÉER:

1. src/modules/SuperAdmin/superadmin/hooks/useModuleDeactivation.ts (CRÉER)
   - Hook avec useMutation
   - Mutation: deactivationService.deactivateModule
   - onSuccess: invalider cache ['tenant-modules', tenantId]
   - Retourne: { deactivate, isDeactivating, result, error }

2. src/modules/SuperAdmin/superadmin/components/deactivation/DeactivationProgress.tsx (CRÉER)
   - Similar à ActivationWizard step 3
   - Props: result (DeactivationResult | null), isDeactivating: boolean
   - Affiche:
     * Progress pendant la désactivation
     * Étapes Saga en temps réel (SagaStepsList)
     * Résultat final:
       - Si succès: Message de succès + lien backup S3 (si créé)
       - Si échec: Message d'erreur + rollbacks

3. src/modules/SuperAdmin/superadmin/components/deactivation/DeactivationConfirmDialog.tsx (MODIFIER)
   - Ajouter state: step ('confirm' | 'deactivating' | 'result')
   - Dans step 'confirm':
     * Affiche ImpactAnalysisView et formulaire
   - Click "Désactiver":
     * Passe à step 'deactivating'
     * Appelle useModuleDeactivation.deactivate()
   - Dans step 'deactivating':
     * Affiche DeactivationProgress
   - Dans step 'result':
     * Affiche le résultat final
     * Bouton "Fermer"

4. src/modules/SuperAdmin/superadmin/components/modules/TenantModuleCard.tsx (MODIFIER)
   - Callback onConfirm dans DeactivationConfirmDialog:
     * Récupère options (backup, force)
     * Lance deactivate({ tenantId, moduleName, options })
     * Le dialog gère l'affichage du résultat

RAPPORT DE DÉSACTIVATION:

5. src/modules/SuperAdmin/superadmin/components/deactivation/DeactivationReport.tsx (CRÉER)
   - Similar à ActivationReport
   - Props: result (DeactivationResult)
   - Sections:
     * Résumé (succès/échec, durée)
     * Étapes exécutées
     * Backup créé (lien S3 si présent)
     * Données supprimées (tables, lignes)
     * Rollbacks (si échec)
   - Action: Export PDF/JSON

6. Intégrer DeactivationReport dans DeactivationProgress

CONTRAINTES:
- Ne pas permettre de fermer le dialog pendant la désactivation
- Afficher le lien de backup S3 de façon prominente
- Permettre de télécharger le rapport
- Notifier par toast après succès

VALIDATION:
- Le workflow complet fonctionne
- L'analyse d'impact s'affiche avant confirmation
- La désactivation s'exécute et affiche le résultat
- Le backup S3 est créé si option cochée
- Le cache est invalidé après succès
```

---

## Story 4.8 à 4.11: Rollback, Rapport, Batch, Audit

Ces stories sont similaires aux stories 3.7 à 3.10 mais pour la désactivation.

### 📝 Prompt d'Implémentation Groupé

```
CONTEXTE:
Tu as déjà implémenté les équivalents pour l'activation (stories 3.7 à 3.10).
Tu dois créer les mêmes features pour la désactivation.

TÂCHE:
Adapter les composants d'activation pour la désactivation.

FICHIERS À CRÉER/ADAPTER:

Story 4.8 - Rollback Automatique Désactivation:
- Réutiliser SagaStepsList déjà créé
- Adapter DeactivationProgress pour afficher les rollbacks
- Same pattern que story 3.7

Story 4.9 - Rapport Détaillé Désactivation:
- DeactivationReport déjà créé en 4.7
- Ajouter export PDF/JSON
- Same pattern que story 3.8

Story 4.10 - Désactivation Batch Modules:
1. src/modules/SuperAdmin/types/deactivation.types.ts (MODIFIER)
   - Type BatchDeactivationRequest similar à BatchActivationRequest
   - Type BatchDeactivationResult similar à BatchActivationResult

2. src/modules/SuperAdmin/superadmin/services/deactivationService.ts (MODIFIER)
   - async batchDeactivate(request: BatchDeactivationRequest)

3. src/modules/SuperAdmin/superadmin/components/deactivation/BatchDeactivationWizard.tsx
   - Similar à BatchActivationWizard
   - Steps:
     * 0: Sélection tenants + modules
     * 1: Analyse d'impact pour chaque combinaison (tableau)
     * 2: Options (backup, force)
     * 3: Exécution et résultat

4. src/app/[lang]/(dashboard)/(private)/superadmin/modules/batch-deactivate/page.tsx
   - Page dédiée ou bouton dans TenantModulesView

Story 4.11 - Audit Trail Désactivation:
- Réutiliser les composants d'audit déjà créés en story 3.10
- L'AuditService gère déjà 'module.deactivated'
- Pas de code supplémentaire nécessaire

PATTERN À SUIVRE:
Pour chaque feature de désactivation:
1. Copier le composant équivalent d'activation
2. Renommer (Activation → Deactivation)
3. Adapter les types (ActivationResult → DeactivationResult)
4. Adapter les services (activationService → deactivationService)
5. Adapter les couleurs (vert → rouge pour désactivation)
6. Adapter les messages utilisateur

CONTRAINTES:
- Réutiliser au maximum les composants communs (SagaStepsList, etc.)
- Garder la cohérence visuelle avec l'activation
- Les messages doivent être clairs sur la désactivation vs activation

VALIDATION:
- Le batch deactivation fonctionne
- Les rapports sont générés
- L'audit trail inclut les désactivations
```

---

# Epic 5: Configuration Services Externes

---

## Story 5.1: Service ServiceConfigManager (pas d'interface directe)

Ce service est utilisé par les stories suivantes.

---

## Story 5.2 & 5.3: Health Checker + API Configuration S3/MinIO

### ✅ User Story
As a **SuperAdmin**,
I want **configurer et tester S3/MinIO**,
So that **le storage des tenants fonctionne correctement**.

### 🎯 Objectif Frontend
Créer un formulaire de configuration S3 avec test de connexion.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Le backend expose:
- GET /api/superadmin/config/s3
- PUT /api/superadmin/config/s3
- POST /api/superadmin/config/s3/test

TÂCHE:
Créer le formulaire de configuration S3.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/types/service-config.types.ts
   - Type ServiceType = 's3' | 'database' | 'redis-cache' | 'redis-queue' | 'ses' | 'meilisearch'

   - Type S3Config:
     * endpoint: string (URL du serveur S3)
     * region: string (région AWS ou 'us-east-1' pour MinIO)
     * bucket: string (nom du bucket)
     * accessKey: string
     * secretKey: string (masqué en GET)
     * usePathStyle: boolean (true pour MinIO)

   - Type TestResult:
     * success: boolean
     * message: string
     * details?: Record<string, any>
     * latencyMs?: number

   - Union pour tous les configs:
     * type ServiceConfig = S3Config | DatabaseConfig | RedisConfig | ...

2. src/modules/SuperAdmin/superadmin/services/serviceConfigService.ts
   - Classe ServiceConfigService avec méthodes pour S3:
     * async getS3Config(): Promise<S3Config>
     * async updateS3Config(config: S3Config): Promise<void>
     * async testS3Connection(config?: S3Config): Promise<TestResult>

   - Note: Les autres services seront ajoutés dans les stories suivantes

3. src/modules/SuperAdmin/superadmin/hooks/useServiceConfig.ts
   - Hook générique useServiceConfig(service: ServiceType)
   - useQuery pour GET
   - useMutation pour PUT
   - Fonction test séparée (non mutation)
   - Retourne: { config, isLoading, save, test, testResult, isTesting }

4. src/modules/SuperAdmin/superadmin/components/services/S3ConfigForm.tsx
   - Composant client
   - Utilise useServiceConfig('s3')
   - React Hook Form + Yup validation

   - Champs:
     * endpoint: TextField (required, URL validation)
     * region: TextField (required)
     * bucket: TextField (required)
     * accessKey: TextField (required)
     * secretKey: TextField type='password' (required)
       - Bouton toggle visibility (icône œil)
       - Placeholder: "●●●●●●●●" si déjà configuré
     * usePathStyle: Checkbox (label: "Utiliser Path-Style (MinIO)")

   - Actions:
     * Bouton "Tester la connexion"
       - Lance test avec valeurs actuelles du formulaire
       - Affiche le résultat sous le bouton:
         * Succès: Alert success avec latence
         * Échec: Alert error avec message
     * Bouton "Annuler" (reset form)
     * Bouton "Enregistrer"
       - Disabled si form invalid
       - Lance save mutation
       - Toast de succès

   - Validation Yup:
     * endpoint: string().url().required()
     * region: string().required()
     * bucket: string().required()
     * accessKey: string().required()
     * secretKey: string().required()

5. src/app/[lang]/(dashboard)/(private)/superadmin/services/config/s3/page.tsx
   - Page de configuration S3
   - Breadcrumbs: Services > Configuration > S3
   - Layout:
     * PageHeader:
       - Titre: "Configuration S3/MinIO"
       - Description: "Configurez le stockage objet pour les tenants"
     * Card contenant S3ConfigForm
   - Affiche un skeleton pendant le chargement

SÉCURITÉ:
- Ne jamais afficher secretKey en clair (sauf si user toggle)
- Backend masque les secrets dans GET (retourne null ou "●●●●●●")
- Placeholder dans input si secret déjà configuré

UX:
- Tester avant save (recommandé mais pas obligatoire)
- Afficher clairement le résultat du test
- Confirmer la sauvegarde par toast
- Redirect ou stay sur la page après save

CONTRAINTES:
- Validation stricte des URLs
- Gestion des erreurs API (afficher message)
- Loading states pour test et save
- Masquer secretKey par défaut

VALIDATION:
- Le formulaire charge la config existante
- La validation fonctionne
- Le test de connexion retourne un résultat
- La sauvegarde met à jour la config
- Les secrets sont masqués correctement
```

---

## Stories 5.4 & 5.5: Database Config

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Similar à S3 mais pour configuration Database.
Endpoints:
- GET /api/superadmin/config/database
- PUT /api/superadmin/config/database
- POST /api/superadmin/config/database/test

TÂCHE:
Créer le formulaire de configuration Database.

FICHIERS À CRÉER/MODIFIER:

1. src/modules/SuperAdmin/types/service-config.types.ts (MODIFIER)
   - Type DatabaseConfig:
     * host: string
     * port: number
     * database: string
     * username: string
     * password: string (masqué)
     * charset: string (default: 'utf8mb4')
     * collation: string (default: 'utf8mb4_unicode_ci')

2. src/modules/SuperAdmin/superadmin/services/serviceConfigService.ts (MODIFIER)
   - Ajouter méthodes:
     * async getDatabaseConfig(): Promise<DatabaseConfig>
     * async updateDatabaseConfig(config: DatabaseConfig): Promise<void>
     * async testDatabaseConnection(config?: DatabaseConfig): Promise<TestResult>

3. src/modules/SuperAdmin/superadmin/components/services/DatabaseConfigForm.tsx (CRÉER)
   - Similar à S3ConfigForm
   - Champs:
     * host: TextField (default: 'localhost')
     * port: TextField type='number' (default: 3306)
     * database: TextField
     * username: TextField
     * password: TextField type='password' (masqué)
     * charset: TextField (default pré-rempli)
     * collation: TextField (default pré-rempli)

   - Validation:
     * host: required
     * port: number between 1-65535
     * database, username, password: required

   - Test et Save comme S3

4. src/app/[lang]/(dashboard)/(private)/superadmin/services/config/database/page.tsx
   - Page configuration Database
   - Similar structure à S3

PATTERN:
Suivre exactement le même pattern que S3ConfigForm.
Tous les formulaires de config services partagent:
- Layout identique
- Bouton test + affichage résultat
- Validation + gestion erreurs
- Loading states
- Masquage des secrets

VALIDATION:
- Port validation numérique
- Test connexion fonctionne
- Sauvegarde met à jour
```

---

## Stories 5.6, 5.7, 5.8: Redis Cache & Queue Config

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Configuration Redis pour Cache ET Queue (2 instances séparées).
Endpoints:
- GET/PUT/POST /api/superadmin/config/redis-cache
- GET/PUT/POST /api/superadmin/config/redis-queue

TÂCHE:
Créer les formulaires Redis Cache et Redis Queue.

FICHIERS À CRÉER/MODIFIER:

1. src/modules/SuperAdmin/types/service-config.types.ts (MODIFIER)
   - Type RedisConfig:
     * host: string
     * port: number
     * password?: string (optionnel, masqué)
     * database: number (0-15)
     * prefix?: string (optionnel)

2. src/modules/SuperAdmin/superadmin/services/serviceConfigService.ts (MODIFIER)
   - Ajouter méthodes pour Cache:
     * getRedisCacheConfig, updateRedisCacheConfig, testRedisCacheConnection
   - Ajouter méthodes pour Queue:
     * getRedisQueueConfig, updateRedisQueueConfig, testRedisQueueConnection

3. src/modules/SuperAdmin/superadmin/components/services/RedisConfigForm.tsx (CRÉER)
   - Composant RÉUTILISABLE pour Cache ET Queue
   - Props: serviceType ('redis-cache' | 'redis-queue')
   - Utilise useServiceConfig(serviceType)

   - Champs:
     * host: TextField (default: 'localhost')
     * port: TextField type='number' (default: 6379)
     * password: TextField type='password' (optionnel)
       - Helper text: "Laisser vide si pas de mot de passe"
     * database: Select (options: 0 to 15)
       - Helper: "Cache: 0, Queue: 1 (recommandé)"
     * prefix: TextField (optionnel)
       - Helper: "Préfixe des clés (ex: 'app_cache_')"

   - Validation:
     * host: required
     * port: number 1-65535
     * database: number 0-15
     * password: optionnel
     * prefix: optionnel, pattern: /^[a-z0-9_]*$/

4. src/app/[lang]/(dashboard)/(private)/superadmin/services/config/redis-cache/page.tsx
   - Affiche RedisConfigForm avec serviceType='redis-cache'
   - Titre: "Configuration Redis Cache"

5. src/app/[lang]/(dashboard)/(private)/superadmin/services/config/redis-queue/page.tsx
   - Affiche RedisConfigForm avec serviceType='redis-queue'
   - Titre: "Configuration Redis Queue"

RÉUTILISABILITÉ:
Le composant RedisConfigForm est générique et s'adapte selon serviceType.
Cela évite de dupliquer le code pour Cache et Queue.

VALIDATION:
- Les deux pages fonctionnent avec le même composant
- La validation est correcte
- Test et save fonctionnent pour les deux
```

---

## Stories 5.9, 5.10: Amazon SES Config

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Configuration Amazon SES pour l'envoi d'emails.
Endpoints:
- GET/PUT/POST /api/superadmin/config/ses

TÂCHE:
Créer le formulaire de configuration SES.

FICHIERS À CRÉER/MODIFIER:

1. src/modules/SuperAdmin/types/service-config.types.ts (MODIFIER)
   - Type SESConfig:
     * region: string (ex: 'us-east-1', 'eu-west-1')
     * accessKey: string
     * secretKey: string (masqué)
     * fromEmail: string (email validation)
     * fromName: string

2. src/modules/SuperAdmin/superadmin/services/serviceConfigService.ts (MODIFIER)
   - Ajouter: getSESConfig, updateSESConfig, testSESConnection

3. src/modules/SuperAdmin/superadmin/components/services/SESConfigForm.tsx (CRÉER)
   - Champs:
     * region: Select avec régions AWS communes:
       - us-east-1 (Virginie du Nord)
       - us-west-2 (Oregon)
       - eu-west-1 (Irlande)
       - eu-central-1 (Francfort)
       - ap-southeast-1 (Singapour)
       - ... (liste complète AWS)
     * accessKey: TextField
     * secretKey: TextField type='password' (masqué)
     * fromEmail: TextField type='email'
     * fromName: TextField

   - Validation:
     * region: required
     * accessKey, secretKey: required
     * fromEmail: required + email format
     * fromName: required

   - Test envoie un email de test (optionnel)
     - Input supplémentaire: "Email de test"
     - Lance POST /test avec { ...config, testEmail }

4. src/app/[lang]/(dashboard)/(private)/superadmin/services/config/ses/page.tsx
   - Page SES config

VALIDATION:
- Select région fonctionne
- Email validation correcte
- Test envoie email (vérifier inbox)
```

---

## Stories 5.11, 5.12: Meilisearch Config

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Configuration Meilisearch pour la recherche full-text.
Endpoints:
- GET/PUT/POST /api/superadmin/config/meilisearch

TÂCHE:
Créer le formulaire de configuration Meilisearch.

FICHIERS À CRÉER/MODIFIER:

1. src/modules/SuperAdmin/types/service-config.types.ts (MODIFIER)
   - Type MeilisearchConfig:
     * host: string (URL du serveur)
     * port: number
     * apiKey: string (masqué)
     * prefix?: string (optionnel, pour index names)

2. src/modules/SuperAdmin/superadmin/services/serviceConfigService.ts (MODIFIER)
   - Ajouter: getMeilisearchConfig, updateMeilisearchConfig, testMeilisearchConnection

3. src/modules/SuperAdmin/superadmin/components/services/MeilisearchConfigForm.tsx (CRÉER)
   - Champs:
     * host: TextField (ex: 'http://localhost' ou 'https://meilisearch.example.com')
     * port: TextField type='number' (default: 7700)
     * apiKey: TextField type='password' (masqué)
       - Helper: "Master key de Meilisearch"
     * prefix: TextField (optionnel)
       - Helper: "Préfixe des index (ex: 'tenant_')"

   - Validation:
     * host: required, URL
     * port: number 1-65535
     * apiKey: required
     * prefix: optionnel

4. src/app/[lang]/(dashboard)/(private)/superadmin/services/config/meilisearch/page.tsx
   - Page Meilisearch config

VALIDATION:
- Form fonctionne
- Test connexion valide apiKey
```

---

## Story 5.13: Audit Trail Configuration Services

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Audit trail pour les changements de configuration.
Réutiliser le système d'audit existant (story 3.10).

TÂCHE:
Étendre l'audit trail pour les configs services.

FICHIERS À MODIFIER:

1. src/modules/SuperAdmin/types/audit.types.ts (MODIFIER)
   - Ajouter types d'actions:
     * 'config.s3.updated'
     * 'config.database.updated'
     * 'config.redis-cache.updated'
     * 'config.redis-queue.updated'
     * 'config.ses.updated'
     * 'config.meilisearch.updated'

2. src/app/[lang]/(dashboard)/(private)/superadmin/audit/services-config/page.tsx (CRÉER)
   - Page d'audit spécifique aux configs
   - Réutilise AuditTimeline et AuditFilters
   - Filtre par défaut: actions commençant par 'config.'

3. src/data/navigation/verticalMenuData.tsx (MODIFIER)
   - Sous Audit, ajouter "Configuration des services"

PAS DE CODE NOUVEAU:
Tous les composants d'audit existent déjà.
Il suffit de créer une page filtrée.

VALIDATION:
- Les changements de config apparaissent dans l'audit
- Le filtre par service fonctionne
```

---

# Epic 6: Dashboard Santé Globale

---

## Story 6.1: Service ServiceHealthChecker Global

### ✅ User Story
As a **SuperAdmin**,
I want **un service pour vérifier la santé de tous les services**,
So that **je peux monitorer l'infrastructure**.

### 🎯 Objectif Frontend
Créer les types et hooks pour le health checking.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Le backend expose: GET /api/superadmin/health
Retourne le statut de tous les services.

TÂCHE:
Créer les types et services pour le health dashboard.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/types/health.types.ts
   - Type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

   - Type ServiceHealth:
     * name: string (nom du service)
     * status: HealthStatus
     * latencyMs: number
     * message: string
     * checkedAt: string (ISO 8601)
     * details?: Record<string, any>

   - Type HealthDashboard:
     * overallStatus: HealthStatus
     * checkedAt: string
     * services: ServiceHealth[]

   - Type GlobalTestResult:
     * overallStatus: HealthStatus
     * services: {
       [serviceName: string]: TestResult
     }

2. src/modules/SuperAdmin/superadmin/services/healthService.ts
   - Classe HealthService avec méthodes:
     * async getHealthDashboard(): Promise<HealthDashboard>
       - GET /api/superadmin/health
     * async testGlobalConnectivity(): Promise<GlobalTestResult>
       - POST /api/superadmin/health/test
     * async getServiceHealth(serviceName: string): Promise<ServiceHealth>
       - GET /api/superadmin/health/${serviceName}

3. src/modules/SuperAdmin/superadmin/hooks/useHealthDashboard.ts
   - Hook useHealthDashboard(options?)
   - Options:
     * autoRefresh: boolean (default: true)
     * interval: number (default: 30000 = 30s)

   - useQuery avec:
     * Query key: ['health-dashboard']
     * refetchInterval: interval (si autoRefresh)

   - Retourne: { health, isLoading, error, refetch }

4. src/modules/SuperAdmin/index.ts (MODIFIER)
   - Exporter types health
   - Exporter healthService

CONTRAINTES:
- Auto-refresh configurable
- Cache court (1 minute max)
- Gestion des erreurs réseau

VALIDATION:
- useHealthDashboard retourne les données
- Auto-refresh fonctionne
- Les types sont corrects
```

---

## Story 6.2: API Dashboard Santé Services - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **voir le dashboard de santé de tous les services**,
So that **je peux surveiller l'infrastructure en un coup d'œil**.

### 🎯 Objectif Frontend
Créer le dashboard de santé principal.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Tu as useHealthDashboard et les types.
Tu dois créer le dashboard visuel.

TÂCHE:
Créer la page dashboard de santé.

FICHIERS À CRÉER:

1. src/modules/SuperAdmin/superadmin/components/health/ServiceHealthCard.tsx
   - Card pour un service
   - Props: service (ServiceHealth)
   - Layout:
     * Header:
       - Icône du service (🗄 S3, 🗃 DB, etc.)
       - Nom du service
       - Badge de statut (coloré)
     * Body:
       - Latence: Xms
       - Message de statut
       - Dernier check: Il y a Xmin
     * Footer (actions):
       - Bouton "Tester" → Lance test manuel
       - Bouton "Configurer" → Navigate vers config

   - Couleurs selon statut:
     * healthy: vert (#4caf50)
     * degraded: orange (#ff9800)
     * unhealthy: rouge (#f44336)

2. src/modules/SuperAdmin/superadmin/components/health/HealthOverview.tsx
   - Composant overview global
   - Props: health (HealthDashboard)
   - Layout:
     * Statut global (grande icône + texte)
     * Statistiques:
       - X services healthy
       - Y services degraded
       - Z services unhealthy
     * Dernière vérification: Il y a Xmin
     * Bouton "Rafraîchir maintenant"
   - Style: Card avec fond coloré selon overallStatus

3. src/modules/SuperAdmin/superadmin/components/health/HealthDashboardView.tsx
   - Composant principal
   - Utilise useHealthDashboard({ autoRefresh: true, interval: 30000 })
   - Layout:
     * HealthOverview en haut
     * Grid de ServiceHealthCard (3 colonnes desktop, 1 mobile)
     * Auto-refresh indicator (petit badge "Auto-refresh ON")
     * Toggle auto-refresh
   - State: autoRefresh (boolean)

4. src/app/[lang]/(dashboard)/(private)/superadmin/health/page.tsx
   - Page principale health dashboard
   - PageHeader:
     * Titre: "Dashboard Santé"
     * Description: "Surveillance de l'infrastructure en temps réel"
     * Actions:
       - Bouton "Tester tous les services"
       - Bouton "Exporter le rapport"
   - Affiche HealthDashboardView
   - Breadcrumbs: Services > Santé

5. src/data/navigation/verticalMenuData.tsx (MODIFIER)
   - Menu "Santé" déjà ajouté en Epic 5
   - S'assurer que route /superadmin/health existe

INTERACTIONS:
- Click "Tester" sur une card → Lance test pour ce service, affiche résultat en toast
- Click "Configurer" → Navigate vers /services/config/{service}
- Click "Tester tous" → Lance healthService.testGlobalConnectivity(), affiche résultats
- Toggle auto-refresh → Active/désactive le refetch interval

UX:
- Skeleton cards pendant le loading initial
- Pulse animation pendant auto-refresh
- Toast lors des changements de statut
- Badge "Last updated" qui se met à jour

CONTRAINTES:
- Responsive grid (3 cols → 2 cols → 1 col)
- Performance: memoization des cards
- Accessibility: ARIA labels pour statuts

VALIDATION:
- Le dashboard affiche tous les services
- Les couleurs correspondent aux statuts
- L'auto-refresh fonctionne
- Les tests manuels fonctionnent
```

---

## Story 6.3: API Test Global Connectivité - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **tester tous les services en un clic**,
So that **je peux valider rapidement la connectivité**.

### 🎯 Objectif Frontend
Ajouter un bouton de test global avec résultats détaillés.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Le dashboard existe (story 6.2).
Tu dois ajouter la fonctionnalité de test global.

TÂCHE:
Implémenter le test global de connectivité.

FICHIERS À CRÉER/MODIFIER:

1. src/modules/SuperAdmin/superadmin/hooks/useGlobalTest.ts (CRÉER)
   - Hook avec useMutation
   - Mutation: healthService.testGlobalConnectivity()
   - Retourne: { test, isTesting, result, error }

2. src/modules/SuperAdmin/superadmin/components/health/GlobalTestDialog.tsx (CRÉER)
   - Dialog pour afficher résultats du test global
   - Props: open, onClose, result (GlobalTestResult | null)
   - Layout:
     * Header: Statut global du test
     * Body: Liste des services testés
       - Pour chaque service:
         * Nom
         * Statut (✓ succès, ✗ échec)
         * Latence
         * Message
     * Footer: Boutons "Fermer" et "Exporter"
   - Couleurs selon résultats

3. src/modules/SuperAdmin/superadmin/components/health/HealthDashboardView.tsx (MODIFIER)
   - Ajouter useGlobalTest hook
   - State: showTestResults
   - Click "Tester tous les services":
     * Lance test.mutate()
     * Affiche loading (progress bar ou spinner)
     * À la fin, affiche GlobalTestDialog
   - GlobalTestDialog visible si result disponible

4. src/modules/SuperAdmin/superadmin/utils/healthExport.ts (CRÉER)
   - Fonction exportHealthReport(health: HealthDashboard, format: 'json' | 'pdf')
   - JSON: Stringify les données
   - PDF: Générer rapport avec jsPDF
     * Titre: "Rapport de Santé Infrastructure"
     * Date
     * Statut global
     * Tableau des services
   - Télécharger: health-report-{date}.{format}

AMÉLIORATIONS:
- Progress bar pendant le test
- Son notification si échec détecté
- Historique des tests (optionnel)

VALIDATION:
- Le test global fonctionne
- Les résultats s'affichent correctement
- L'export génère un fichier valide
```

---

## Story 6.4: Indicateurs Visuels Statut - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **des indicateurs visuels clairs du statut**,
So that **je vois rapidement les problèmes**.

### 🎯 Objectif Frontend
Améliorer les indicateurs visuels du dashboard.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Le dashboard existe avec des couleurs basiques.
Tu dois améliorer les indicateurs visuels.

TÂCHE:
Améliorer les indicateurs visuels du dashboard.

FICHIERS À CRÉER/MODIFIER:

1. src/modules/SuperAdmin/superadmin/components/health/StatusBadge.tsx (CRÉER)
   - Composant réutilisable pour badge de statut
   - Props: status (HealthStatus), size ('small' | 'medium' | 'large')
   - Affiche:
     * Dot coloré pulsant (si degraded ou unhealthy)
     * Label texte
   - Variants:
     * healthy: Dot vert statique + "Opérationnel"
     * degraded: Dot orange pulsant + "Dégradé"
     * unhealthy: Dot rouge pulsant + "Hors service"

2. src/modules/SuperAdmin/superadmin/components/health/LatencyIndicator.tsx (CRÉER)
   - Composant pour afficher la latence avec code couleur
   - Props: latencyMs (number)
   - Couleurs:
     * < 50ms: vert (excellent)
     * 50-100ms: vert clair (bon)
     * 100-200ms: orange (acceptable)
     * 200-500ms: orange foncé (lent)
     * > 500ms: rouge (très lent)
   - Affiche: "{latency}ms" avec couleur de fond

3. src/modules/SuperAdmin/superadmin/components/health/ServiceHealthCard.tsx (MODIFIER)
   - Utiliser StatusBadge pour le statut
   - Utiliser LatencyIndicator pour la latence
   - Ajouter icône animée pendant test
   - Ajouter trend indicator (↑ ↓ ↔) si latence change

4. src/modules/SuperAdmin/superadmin/components/health/HealthOverview.tsx (MODIFIER)
   - StatusBadge size='large' pour statut global
   - Donut chart (optionnel) pour la répartition:
     * Installer: pnpm add recharts
     * Chart: % healthy / degraded / unhealthy

5. Ajouter animations CSS:
   - Pulse pour statuts problématiques
   - Fade in pour nouvelles données
   - Slide pour changements de statut

AMÉLIORATIONS VISUELLES:
- Gradient backgrounds selon statut
- Icônes animées (loading, success, error)
- Tooltip avec détails au hover
- Transition smooth entre statuts

CONTRAINTES:
- Accessibilité: ne pas se fier QUE aux couleurs
- Ajouter texte et icônes
- Respecter WCAG AA pour les contrastes

VALIDATION:
- Les indicateurs sont immédiatement compréhensibles
- Les animations ne sont pas trop distrayantes
- L'accessibilité est respectée
```

---

## Story 6.5: Cache Health Checks - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **que les checks de santé soient cachés**,
So that **le dashboard soit performant**.

### 🎯 Objectif Frontend
Optimiser les performances avec cache.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
React Query gère déjà le cache (story 2.9).
Tu dois configurer les bonnes options de cache.

TÂCHE:
Optimiser le cache pour health checks.

FICHIERS À MODIFIER:

1. src/modules/SuperAdmin/superadmin/hooks/useHealthDashboard.ts
   - Configurer React Query options:
     * staleTime: 30000 (30s - données considérées fresh)
     * cacheTime: 300000 (5min - garde en cache)
     * refetchInterval: 30000 (si autoRefresh)
     * refetchOnWindowFocus: true (recheck au focus)
     * refetchOnReconnect: true (recheck après reconnexion)

2. src/providers/QueryProvider.tsx (MODIFIER si nécessaire)
   - S'assurer que les defaults sont appropriés
   - Peut-être ajouter des overrides pour 'health-*' queries

PAS GRAND CHOSE À FAIRE:
React Query gère déjà le cache intelligemment.
Il suffit de bien configurer les options.

OPTIMISATIONS SUPPLÉMENTAIRES:
- Prefetch au hover sur menu "Santé"
- Background refetch discret
- Optimistic updates après test manuel

VALIDATION:
- Pas de double appel API en navigation
- Auto-refresh respecte l'interval
- Cache invalidé après test manuel
```

---

## Story 6.6: Intégration Spatie Laravel Health - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **intégrer avec Spatie Laravel Health**,
So that **j'ai des checks de santé avancés**.

### 🎯 Objectif Frontend
Pas de changement frontend - backend seulement.

### 📝 Note
```
Cette story concerne l'intégration backend avec le package Spatie.
Le frontend consomme déjà l'API /health qui sera enrichie par Spatie.

AUCUNE MODIFICATION FRONTEND NÉCESSAIRE.

Les données retournées par l'API restent compatibles avec les types
HealthDashboard et ServiceHealth déjà définis.
```

---

## Story 6.7: Audit Trail Health Checks - Interface

### ✅ User Story
As a **SuperAdmin**,
I want **logger les checks de santé dans l'audit trail**,
So that **je peux tracer les problèmes**.

### 🎯 Objectif Frontend
Ajouter une page d'audit pour les health checks.

### 📝 Prompt d'Implémentation

```
CONTEXTE:
Le système d'audit existe (story 3.10).
Tu dois créer une vue spécifique pour les health checks.

TÂCHE:
Créer une page d'audit pour health checks.

FICHIERS À MODIFIER/CRÉER:

1. src/modules/SuperAdmin/types/audit.types.ts (MODIFIER)
   - Ajouter types:
     * 'health.checked'
     * 'health.test.manual'
     * 'health.status.changed'

2. src/app/[lang]/(dashboard)/(private)/superadmin/audit/health/page.tsx (CRÉER)
   - Page d'audit spécifique health
   - Réutilise AuditTimeline et AuditFilters
   - Filtres supplémentaires:
     * Par service (S3, DB, Redis, etc.)
     * Par statut (healthy → unhealthy, etc.)
   - Affiche:
     * Historique des checks
     * Changements de statut
     * Tests manuels effectués

3. src/modules/SuperAdmin/superadmin/components/health/HealthHistoryChart.tsx (CRÉER - optionnel)
   - Graphique de l'évolution du statut
   - Props: serviceName (string), period ('24h' | '7d' | '30d')
   - Utilise Recharts:
     * Line chart avec latence au fil du temps
     * Zones colorées selon statut (vert/orange/rouge)
   - Affiche les incidents (passages unhealthy)

4. src/app/[lang]/(dashboard)/(private)/superadmin/health/history/page.tsx (CRÉER - optionnel)
   - Page d'historique avec graphiques
   - Select service
   - Select période
   - HealthHistoryChart

5. src/data/navigation/verticalMenuData.tsx (MODIFIER)
   - Sous Audit: "Health Checks"

FEATURES AVANCÉES (optionnelles):
- Alertes email si service down
- Webhooks pour notifications
- Dashboard temps réel (WebSockets)

VALIDATION:
- L'audit log des health checks fonctionne
- Les filtres fonctionnent
- L'historique est consultable
```

---

## 🎉 CONCLUSION

Vous avez maintenant **TOUS LES PROMPTS** pour implémenter l'interface frontend complète du Module SuperAdmin !

### 📊 Récapitulatif

**Total de stories avec interface:** 38 stories (sur 59 au total)

**Répartition par Epic:**
- Epic 2 (Découverte Modules): 9 stories ✅
- Epic 3 (Activation): 6 stories ✅
- Epic 4 (Désactivation): 7 stories ✅
- Epic 5 (Config Services): 9 stories ✅
- Epic 6 (Dashboard Santé): 7 stories ✅

### 📝 Plan d'Exécution Recommandé

**Semaine 1-2: Fondations + Epic 2**
- Stories 2.1 à 2.9

**Semaine 3-4: Epic 3 (Activation)**
- Stories 3.6 à 3.10

**Semaine 5-6: Epic 4 (Désactivation)**
- Stories 4.5 à 4.11

**Semaine 7-10: Epic 5 (Config Services)**
- Stories 5.2/5.3 à 5.13

**Semaine 11-12: Epic 6 (Dashboard Santé)**
- Stories 6.1 à 6.7

### 💡 Conseils

1. **Suivez l'ordre des prompts** - Chaque story s'appuie sur les précédentes
2. **Testez au fur et à mesure** - Validez chaque story avant de passer à la suivante
3. **Réutilisez les composants** - Beaucoup de patterns se répètent
4. **Utilisez TypeScript strict** - Les types vous guideront
5. **Commitez souvent** - Un commit par story terminée

Bon courage pour l'implémentation ! 🚀