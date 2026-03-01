# Proposition d'Interface Utilisateur - SuperAdmin Module

**Date:** 2026-01-29
**Projet:** iCall26 - Module SuperAdmin
**Frontend:** NextJS 15 + Material-UI 6 + TypeScript
**Backend:** Laravel 11 Multi-tenant

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture des Écrans](#architecture-des-écrans)
3. [Composants Réutilisables](#composants-réutilisables)
4. [Services et Hooks](#services-et-hooks)
5. [Types TypeScript](#types-typescript)
6. [Descriptions Détaillées des Écrans](#descriptions-détaillées-des-écrans)
7. [Navigation et Menu](#navigation-et-menu)
8. [Workflows Utilisateur](#workflows-utilisateur)

---

## Vue d'Ensemble

### Objectif

Créer une interface complète pour le **Module SuperAdmin** qui permet de:
- **Gérer les sites/tenants** (déjà partiellement implémenté)
- **Découvrir et naviguer dans les modules** disponibles
- **Activer/Désactiver des modules** pour les tenants
- **Configurer les services externes** (S3, Database, Redis, SES, Meilisearch)
- **Monitorer la santé** de tous les services

### Stack Technique

- **Framework:** Next.js 15 (App Router)
- **UI Library:** Material-UI (MUI) 6
- **State Management:** React Hooks + Redux Toolkit (pour état global si nécessaire)
- **Forms:** React Hook Form + Yup/Zod validation
- **API Client:** Axios (via `createApiClient` existant)
- **i18n:** Support Fr/En/Ar (déjà configuré)

### Architecture Modulaire

Le frontend suit l'architecture modulaire du backend:

```
src/modules/SuperAdmin/
├── superadmin/
│   ├── components/          # Composants UI spécifiques
│   │   ├── modules/         # Gestion modules
│   │   ├── services/        # Configuration services
│   │   ├── health/          # Dashboard santé
│   │   └── shared/          # Composants partagés
│   ├── hooks/               # Custom hooks
│   ├── services/            # API services
│   └── utils/               # Utilitaires
├── types/                   # TypeScript types
└── index.ts                 # Barrel export
```

---

## Architecture des Écrans

### Epic 1: Infrastructure (Déjà implémenté côté backend)

Pas d'écrans spécifiques - infrastructure technique

### Epic 2: Découverte et Navigation des Modules

#### 2.1 Liste des Modules Disponibles
**Route:** `/superadmin/modules`
**Fonctionnalités:**
- Afficher tous les modules disponibles dans le système
- Filtrer par statut, catégorie, dépendances
- Recherche par nom/description
- Vue en grille ou tableau
- Détails de chaque module (version, dépendances, description)

#### 2.2 Modules par Tenant
**Route:** `/superadmin/sites/:id/modules`
**Fonctionnalités:**
- Liste des modules activés pour un tenant spécifique
- Liste des modules disponibles mais non activés
- Recherche et filtrage
- Actions rapides: activer/désactiver

#### 2.3 Graphe de Dépendances
**Route:** `/superadmin/modules/:name/dependencies`
**Fonctionnalités:**
- Visualisation graphique des dépendances
- Identification des modules dépendants
- Highlight des modules requis

### Epic 3: Activation des Modules

#### 3.1 Assistant d'Activation
**Modal/Page:** Workflow d'activation en plusieurs étapes
**Fonctionnalités:**
- Étape 1: Sélection du module
- Étape 2: Vérification des dépendances
- Étape 3: Configuration optionnelle
- Étape 4: Confirmation et activation
- Affichage du rapport d'activation (Saga steps)
- Gestion du rollback en cas d'échec

#### 3.2 Activation par Lot
**Page:** `/superadmin/modules/batch-activate`
**Fonctionnalités:**
- Sélection multiple de modules
- Activation groupée pour un ou plusieurs tenants
- Rapport détaillé par module/tenant
- Suivi en temps réel

### Epic 4: Désactivation des Modules

#### 4.1 Analyse d'Impact
**Modal:** Avant désactivation
**Fonctionnalités:**
- Affichage des modules dépendants
- Alerte sur les données à supprimer
- Confirmation obligatoire
- Prévisualisation des conséquences

#### 4.2 Désactivation avec Backup
**Workflow:** Processus guidé
**Fonctionnalités:**
- Option de backup S3 des données
- Rollback des migrations
- Rapport détaillé
- Journal d'audit

### Epic 5: Configuration Services Externes

#### 5.1 Dashboard Configuration
**Route:** `/superadmin/services/config`
**Fonctionnalités:**
- Vue d'ensemble de toutes les configurations
- Cartes par service (S3, DB, Redis, SES, Meilisearch)
- Indicateurs de statut (configuré/non configuré)
- Accès rapide aux formulaires de config

#### 5.2 Formulaires de Configuration
**Sous-pages par service:**
- `/superadmin/services/config/s3`
- `/superadmin/services/config/database`
- `/superadmin/services/config/redis`
- `/superadmin/services/config/ses`
- `/superadmin/services/config/meilisearch`

**Fonctionnalités communes:**
- Formulaire de configuration
- Validation en temps réel
- Test de connexion
- Sauvegarde sécurisée (chiffrement)
- Masquage des secrets

### Epic 6: Dashboard Santé Globale

#### 6.1 Dashboard Principal
**Route:** `/superadmin/health`
**Fonctionnalités:**
- Vue d'ensemble du statut global
- Cartes par service avec indicateurs visuels
- Graphiques de latence
- Historique des checks
- Rafraîchissement auto/manuel
- Alertes en temps réel

#### 6.2 Détails par Service
**Modal/Drawer:** Détails d'un service spécifique
**Fonctionnalités:**
- Métriques détaillées
- Historique des tests
- Logs d'erreurs
- Actions correctives suggérées

---

## Composants Réutilisables

### Composants de Base

#### 1. ModuleCard
**Utilisation:** Affichage d'un module
**Props:**
```typescript
interface ModuleCardProps {
  module: Module;
  tenantStatus?: TenantModuleStatus;
  onActivate?: (module: Module) => void;
  onDeactivate?: (module: Module) => void;
  onViewDetails?: (module: Module) => void;
}
```
**Features:**
- Avatar avec icône du module
- Nom et description
- Badge de statut (actif/inactif)
- Badges de dépendances
- Actions (activer/désactiver/détails)

#### 2. ServiceHealthCard
**Utilisation:** Carte de statut d'un service
**Props:**
```typescript
interface ServiceHealthCardProps {
  service: ServiceHealth;
  onTest?: () => Promise<void>;
  onConfigure?: () => void;
}
```
**Features:**
- Indicateur visuel de santé (vert/jaune/rouge)
- Nom du service
- Latence
- Dernier check
- Actions (tester/configurer)

#### 3. ActivationWizard
**Utilisation:** Assistant d'activation de module
**Props:**
```typescript
interface ActivationWizardProps {
  module: string;
  tenantId: number;
  onComplete: (result: ActivationResult) => void;
  onCancel: () => void;
}
```
**Steps:**
1. Informations module
2. Vérification dépendances
3. Configuration
4. Confirmation
5. Résultat

#### 4. DependencyGraph
**Utilisation:** Visualisation des dépendances
**Library:** react-flow ou D3.js
**Props:**
```typescript
interface DependencyGraphProps {
  module: string;
  dependencies: ModuleDependency[];
  onNodeClick?: (moduleName: string) => void;
}
```

#### 5. ServiceConfigForm
**Utilisation:** Formulaire de configuration service
**Props:**
```typescript
interface ServiceConfigFormProps {
  service: ServiceType;
  initialValues?: ServiceConfig;
  onSubmit: (values: ServiceConfig) => Promise<void>;
  onTest: (values: ServiceConfig) => Promise<TestResult>;
}
```

#### 6. AuditTrailTimeline
**Utilisation:** Historique des actions
**Props:**
```typescript
interface AuditTrailTimelineProps {
  actions: AuditAction[];
  filter?: AuditFilter;
}
```

### Composants de Layout

#### 1. SuperAdminLayout
**Utilisation:** Layout spécifique SuperAdmin
**Features:**
- Header avec breadcrumbs
- Sidebar avec navigation SuperAdmin
- Zone de contenu principale
- Footer avec infos système

#### 2. PageHeader
**Utilisation:** En-tête de page standardisé
**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}
```

### Composants de Data Display

#### 1. ModulesTable
**Utilisation:** Tableau de modules avec filtres
**Features:**
- Pagination
- Tri multi-colonnes
- Recherche
- Filtres avancés
- Sélection multiple
- Actions en masse

#### 2. HealthDashboard
**Utilisation:** Dashboard des services
**Features:**
- Grille de cartes de services
- Statut global
- Graphiques de performance
- Auto-refresh

---

## Services et Hooks

### Services API

#### 1. ModuleService
**Fichier:** `services/moduleService.ts`
**Méthodes:**
```typescript
class ModuleService {
  // Liste tous les modules disponibles
  async getAvailableModules(): Promise<Module[]>

  // Modules pour un tenant spécifique
  async getTenantModules(tenantId: number): Promise<TenantModule[]>

  // Détails d'un module
  async getModuleDetails(moduleName: string): Promise<ModuleDetails>

  // Graphe de dépendances
  async getDependencyGraph(moduleName: string): Promise<DependencyGraph>

  // Modules dépendants
  async getDependentModules(moduleName: string): Promise<string[]>

  // Activation
  async activateModule(
    tenantId: number,
    moduleName: string,
    config?: Record<string, any>
  ): Promise<ActivationResult>

  // Désactivation
  async deactivateModule(
    tenantId: number,
    moduleName: string,
    options?: DeactivationOptions
  ): Promise<DeactivationResult>

  // Analyse d'impact
  async analyzeDeactivationImpact(
    tenantId: number,
    moduleName: string
  ): Promise<ImpactAnalysis>

  // Activation par lot
  async batchActivate(
    requests: BatchActivationRequest[]
  ): Promise<BatchActivationResult>
}
```

#### 2. ServiceConfigService
**Fichier:** `services/serviceConfigService.ts`
**Méthodes:**
```typescript
class ServiceConfigService {
  // Récupérer config S3
  async getS3Config(): Promise<S3Config>
  async updateS3Config(config: S3Config): Promise<void>
  async testS3Connection(config?: S3Config): Promise<TestResult>

  // Récupérer config Database
  async getDatabaseConfig(): Promise<DatabaseConfig>
  async updateDatabaseConfig(config: DatabaseConfig): Promise<void>
  async testDatabaseConnection(config?: DatabaseConfig): Promise<TestResult>

  // Redis Cache
  async getRedisCacheConfig(): Promise<RedisConfig>
  async updateRedisCacheConfig(config: RedisConfig): Promise<void>
  async testRedisCacheConnection(config?: RedisConfig): Promise<TestResult>

  // Redis Queue
  async getRedisQueueConfig(): Promise<RedisConfig>
  async updateRedisQueueConfig(config: RedisConfig): Promise<void>
  async testRedisQueueConnection(config?: RedisConfig): Promise<TestResult>

  // Amazon SES
  async getSESConfig(): Promise<SESConfig>
  async updateSESConfig(config: SESConfig): Promise<void>
  async testSESConnection(config?: SESConfig): Promise<TestResult>

  // Meilisearch
  async getMeilisearchConfig(): Promise<MeilisearchConfig>
  async updateMeilisearchConfig(config: MeilisearchConfig): Promise<void>
  async testMeilisearchConnection(config?: MeilisearchConfig): Promise<TestResult>
}
```

#### 3. HealthService
**Fichier:** `services/healthService.ts`
**Méthodes:**
```typescript
class HealthService {
  // Dashboard global
  async getHealthDashboard(): Promise<HealthDashboard>

  // Test global de connectivité
  async testGlobalConnectivity(): Promise<GlobalTestResult>

  // Détails d'un service
  async getServiceHealth(serviceName: string): Promise<ServiceHealth>
}
```

#### 4. AuditService
**Fichier:** `services/auditService.ts`
**Méthodes:**
```typescript
class AuditService {
  // Récupérer les logs d'audit
  async getAuditLogs(filter?: AuditFilter): Promise<AuditLog[]>

  // Exporter les logs
  async exportAuditLogs(format: 'csv' | 'json', filter?: AuditFilter): Promise<Blob>
}
```

### Custom Hooks

#### 1. useModules
```typescript
function useModules() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    // Fetch modules
  }, [])

  useEffect(() => { refresh() }, [])

  return { modules, loading, error, refresh }
}
```

#### 2. useTenantModules
```typescript
function useTenantModules(tenantId: number) {
  // Similar to useModules but for specific tenant
  return {
    modules,
    loading,
    error,
    refresh,
    activateModule,
    deactivateModule
  }
}
```

#### 3. useModuleActivation
```typescript
function useModuleActivation() {
  const [activating, setActivating] = useState(false)
  const [result, setResult] = useState<ActivationResult | null>(null)

  const activate = useCallback(async (
    tenantId: number,
    moduleName: string,
    config?: Record<string, any>
  ) => {
    // Handle activation
  }, [])

  return { activate, activating, result }
}
```

#### 4. useServiceHealth
```typescript
function useServiceHealth(autoRefresh = true, interval = 30000) {
  const [health, setHealth] = useState<HealthDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    // Fetch health data
  }, [])

  useEffect(() => {
    refresh()
    if (autoRefresh) {
      const timer = setInterval(refresh, interval)
      return () => clearInterval(timer)
    }
  }, [autoRefresh, interval])

  return { health, loading, refresh }
}
```

#### 5. useServiceConfig
```typescript
function useServiceConfig(service: ServiceType) {
  const [config, setConfig] = useState<ServiceConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)

  const save = useCallback(async (values: ServiceConfig) => {
    // Save config
  }, [service])

  const test = useCallback(async (values?: ServiceConfig) => {
    // Test connection
  }, [service])

  return { config, loading, save, test, testing }
}
```

---

## Types TypeScript

### Module Types

```typescript
// Module de base
export interface Module {
  name: string;
  displayName: string;
  description: string;
  version: string;
  enabled: boolean;
  category: ModuleCategory;
  icon?: string;
  dependencies: string[];
  dependents: string[];
  path: string;
  hasConfig: boolean;
  hasMigrations: boolean;
  hasSeeds: boolean;
}

// Statut d'un module pour un tenant
export interface TenantModuleStatus {
  isActive: boolean;
  installedAt: string | null;
  config: Record<string, any>;
}

// Module avec statut tenant
export interface TenantModule extends Module {
  tenantStatus: TenantModuleStatus;
}

// Catégories de modules
export type ModuleCategory =
  | 'core'
  | 'business'
  | 'integration'
  | 'ui'
  | 'utility';

// Dépendance de module
export interface ModuleDependency {
  from: string;
  to: string;
  required: boolean;
  version?: string;
}

// Graphe de dépendances
export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface DependencyNode {
  id: string;
  label: string;
  type: 'module' | 'external';
  status: 'active' | 'inactive' | 'missing';
}

export interface DependencyEdge {
  from: string;
  to: string;
  required: boolean;
}
```

### Activation/Deactivation Types

```typescript
// Requête d'activation
export interface ActivationRequest {
  tenantId: number;
  moduleName: string;
  config?: Record<string, any>;
}

// Résultat d'activation
export interface ActivationResult {
  success: boolean;
  module: string;
  steps: SagaStep[];
  installedAt?: string;
  error?: string;
}

// Étape de Saga
export interface SagaStep {
  name: string;
  status: 'pending' | 'completed' | 'failed' | 'rolled_back';
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// Analyse d'impact
export interface ImpactAnalysis {
  canDeactivate: boolean;
  blockers: string[];
  warnings: string[];
  affectedData: {
    tables: string[];
    estimatedRows: number;
  };
  dependentModules: string[];
}

// Options de désactivation
export interface DeactivationOptions {
  backup: boolean;
  force: boolean;
}

// Résultat de désactivation
export interface DeactivationResult {
  success: boolean;
  module: string;
  backupPath?: string;
  steps: SagaStep[];
  error?: string;
}

// Activation par lot
export interface BatchActivationRequest {
  tenantId: number;
  modules: string[];
}

export interface BatchActivationResult {
  total: number;
  successful: number;
  failed: number;
  results: {
    module: string;
    tenantId: number;
    success: boolean;
    error?: string;
  }[];
}
```

### Service Config Types

```typescript
// Types de services
export type ServiceType =
  | 's3'
  | 'database'
  | 'redis-cache'
  | 'redis-queue'
  | 'ses'
  | 'meilisearch';

// Configuration S3
export interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string; // Masked in GET responses
  usePathStyle: boolean;
}

// Configuration Database
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string; // Masked in GET responses
  charset: string;
  collation: string;
}

// Configuration Redis
export interface RedisConfig {
  host: string;
  port: number;
  password?: string; // Masked in GET responses
  database: number;
  prefix?: string;
}

// Configuration SES
export interface SESConfig {
  region: string;
  accessKey: string;
  secretKey: string; // Masked in GET responses
  fromEmail: string;
  fromName: string;
}

// Configuration Meilisearch
export interface MeilisearchConfig {
  host: string;
  port: number;
  apiKey: string; // Masked in GET responses
  prefix?: string;
}

// Union de toutes les configs
export type ServiceConfig =
  | S3Config
  | DatabaseConfig
  | RedisConfig
  | SESConfig
  | MeilisearchConfig;

// Résultat de test
export interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
  latencyMs?: number;
}
```

### Health Types

```typescript
// Statut de santé
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

// Santé d'un service
export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  latencyMs: number;
  message: string;
  checkedAt: string;
  details?: Record<string, any>;
}

// Dashboard de santé
export interface HealthDashboard {
  overallStatus: HealthStatus;
  checkedAt: string;
  services: ServiceHealth[];
}

// Résultat de test global
export interface GlobalTestResult {
  overallStatus: HealthStatus;
  services: {
    [serviceName: string]: TestResult;
  };
}
```

### Audit Types

```typescript
// Action d'audit
export interface AuditAction {
  id: number;
  userId: number;
  userName: string;
  action: AuditActionType;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Types d'actions
export type AuditActionType =
  | 'module.activated'
  | 'module.deactivated'
  | 'config.updated'
  | 'health.checked'
  | 'batch.activated';

// Filtre d'audit
export interface AuditFilter {
  userId?: number;
  action?: AuditActionType;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}
```

---

## Descriptions Détaillées des Écrans

### 1. Page: Liste des Modules
**Route:** `/[lang]/superadmin/modules`

#### Layout
```
┌─────────────────────────────────────────────────────────┐
│ 📦 Gestion des Modules                    [+ Nouveau]   │
│ Découvrez et gérez tous les modules disponibles         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [🔍 Rechercher...] [Catégorie ▼] [Statut ▼] [Vue ⊞⊟]   │
│                                                          │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│ │  📧      │  │  👥      │  │  🛒      │               │
│ │ Mail     │  │ Users    │  │ Commerce │               │
│ │ v2.1.0   │  │ v3.0.0   │  │ v1.5.0   │               │
│ │ ✓ Actif  │  │ ⊘ Inactif│  │ ✓ Actif  │               │
│ │ 5 deps   │  │ 2 deps   │  │ 8 deps   │               │
│ │ [⚡][📊] │  │ [⚡][📊] │  │ [⚡][📊] │               │
│ └──────────┘  └──────────┘  └──────────┘               │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Pagination: 1 2 3 ... 10  [15 par page ▼]         │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Features
- **Header:** Titre + description + bouton d'action (si applicable)
- **Filtres:** Recherche full-text, filtre par catégorie, statut
- **Vue:** Basculer entre grille de cartes et tableau
- **Cartes de module:**
  - Icône/Avatar du module
  - Nom et version
  - Badge de statut (actif/inactif)
  - Nombre de dépendances
  - Actions: Activer ⚡, Voir détails 📊
- **Pagination:** Standard avec options de taille de page

---

### 2. Page: Modules d'un Tenant
**Route:** `/[lang]/superadmin/sites/:id/modules`

#### Layout
```
┌─────────────────────────────────────────────────────────┐
│ ← Sites / example.com / Modules                         │
├─────────────────────────────────────────────────────────┤
│ 🌐 Modules de example.com               [Activer en lot]│
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Modules Actifs (12)            [Rechercher...]      │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ☑ Mail          v2.1.0   Actif depuis 3 mois  [⚙][✖]│ │
│ │ ☑ Users         v3.0.0   Actif depuis 1 an    [⚙][✖]│ │
│ │ ☑ Commerce      v1.5.0   Actif depuis 6 mois  [⚙][✖]│ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Modules Disponibles (8)         [Rechercher...]     │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ☐ Analytics     v1.0.0   Nécessite: Stats    [+]    │ │
│ │ ☐ CRM           v2.0.0   Nécessite: Users    [+]    │ │
│ │ ☐ Invoicing     v1.2.0   Prêt à installer    [+]    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Features
- **Breadcrumbs:** Navigation hiérarchique
- **Sections séparées:**
  - Modules actifs (avec actions: configurer, désactiver)
  - Modules disponibles (avec action: activer)
- **Sélection multiple:** Pour activation en lot
- **Badge de dépendances:** Alerte si dépendances manquantes
- **Actions contextuelles par module**

---

### 3. Modal: Assistant d'Activation
**Trigger:** Bouton "Activer" sur un module

#### Step 1: Informations
```
┌─────────────────────────────────────────────────────────┐
│ Activation de Module                           [✖]      │
├─────────────────────────────────────────────────────────┤
│ ● Informations    ○ Dépendances    ○ Config    ○ Confirm│
│                                                          │
│ 📦 Module: Commerce                                      │
│ Version: 1.5.0                                           │
│                                                          │
│ Description:                                             │
│ Module e-commerce complet avec gestion produits,         │
│ commandes, paiements et livraisons.                      │
│                                                          │
│ Tenant cible: example.com                                │
│                                                          │
│ [Annuler]                              [Suivant →]      │
└─────────────────────────────────────────────────────────┘
```

#### Step 2: Dépendances
```
┌─────────────────────────────────────────────────────────┐
│ Activation de Module                           [✖]      │
├─────────────────────────────────────────────────────────┤
│ ○ Informations    ● Dépendances    ○ Config    ○ Confirm│
│                                                          │
│ Vérification des dépendances...                          │
│                                                          │
│ ✓ Users v3.0.0 (installé)                                │
│ ✓ Payment v1.0.0 (installé)                              │
│ ✗ Inventory v2.0.0 (manquant)                            │
│                                                          │
│ ⚠ Une dépendance est manquante                           │
│                                                          │
│ [☑] Installer automatiquement Inventory                 │
│                                                          │
│ [← Retour]                             [Suivant →]      │
└─────────────────────────────────────────────────────────┘
```

#### Step 3: Configuration (optionnelle)
```
┌─────────────────────────────────────────────────────────┐
│ Activation de Module                           [✖]      │
├─────────────────────────────────────────────────────────┤
│ ○ Informations    ○ Dépendances    ● Config    ○ Confirm│
│                                                          │
│ Configuration du module Commerce                         │
│                                                          │
│ Devise par défaut:                                       │
│ [EUR ▼]                                                  │
│                                                          │
│ Mode paiement:                                           │
│ ☑ Carte bancaire                                         │
│ ☐ Virement                                               │
│ ☑ PayPal                                                 │
│                                                          │
│ [← Retour]                             [Suivant →]      │
└─────────────────────────────────────────────────────────┘
```

#### Step 4: Confirmation et Résultat
```
┌─────────────────────────────────────────────────────────┐
│ Activation de Module                           [✖]      │
├─────────────────────────────────────────────────────────┤
│ ○ Informations    ○ Dépendances    ○ Config    ● Confirm│
│                                                          │
│ Activation en cours...                                   │
│                                                          │
│ ✓ Vérification des dépendances                           │
│ ✓ Création du storage S3                                 │
│ ⏳ Exécution des migrations... (3/10)                    │
│ ⏸ Publication des assets                                │
│ ⏸ Enregistrement du module                              │
│                                                          │
│ [Annuler]                              [Fermer]         │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Page: Configuration des Services
**Route:** `/[lang]/superadmin/services/config`

#### Layout
```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Configuration des Services                            │
│ Configurez et testez les services externes               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│ │ 🗄️ S3    │  │ 🗃️ DB    │  │ 📮 Redis │               │
│ │          │  │          │  │          │               │
│ │ ✓ Config │  │ ✓ Config │  │ ⚠ Non   │               │
│ │ ● Healthy│  │ ● Healthy│  │   config │               │
│ │          │  │          │  │          │               │
│ │[Config]  │  │[Config]  │  │[Config]  │               │
│ └──────────┘  └──────────┘  └──────────┘               │
│                                                          │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│ │ 📧 SES   │  │ 🔍 Meili │  │ 📦 Redis │               │
│ │          │  │          │  │   Queue  │               │
│ │ ✓ Config │  │ ✗ Non    │  │ ✓ Config │               │
│ │ ● Healthy│  │   config │  │ ⚠ Degrad │               │
│ │          │  │          │  │          │               │
│ │[Config]  │  │[Config]  │  │[Config]  │               │
│ └──────────┘  └──────────┘  └──────────┘               │
│                                                          │
│ Statut global: ⚠ Dégradé (2 services à configurer)      │
└─────────────────────────────────────────────────────────┘
```

#### Features
- **Grille de cartes:** Un par service
- **Indicateurs visuels:**
  - Badge de configuration (configuré/non configuré)
  - Indicateur de santé (healthy/degraded/unhealthy)
- **Actions:** Bouton pour accéder au formulaire de config
- **Statut global:** Résumé en bas de page

---

### 5. Page: Formulaire de Configuration S3
**Route:** `/[lang]/superadmin/services/config/s3`

#### Layout
```
┌─────────────────────────────────────────────────────────┐
│ ← Services / Configuration S3/MinIO                      │
├─────────────────────────────────────────────────────────┤
│ 🗄️ Configuration S3/MinIO                                │
│                                                          │
│ Endpoint *                                               │
│ [https://s3.example.com                              ]  │
│                                                          │
│ Région *                                                 │
│ [us-east-1                                           ]  │
│                                                          │
│ Bucket *                                                 │
│ [my-tenant-storage                                   ]  │
│                                                          │
│ Access Key *                                             │
│ [AKIAIOSFODNN7EXAMPLE                                ]  │
│                                                          │
│ Secret Key *                                             │
│ [●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●]  [👁]             │
│                                                          │
│ ☑ Utiliser Path-Style (pour MinIO)                      │
│                                                          │
│ [Tester la connexion]  [Annuler]  [Enregistrer]         │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ℹ️ Résultat du dernier test:                         │ │
│ │ ✓ Connexion réussie en 45ms                          │ │
│ │ Bucket accessible, permissions OK                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Features
- **Formulaire validé:** React Hook Form + Yup/Zod
- **Champs masqués:** Les secrets sont masqués avec option de révéler
- **Test de connexion:** Bouton pour tester avant sauvegarde
- **Feedback visuel:** Affichage du résultat du test
- **Validation temps réel:** Erreurs affichées sous les champs

---

### 6. Page: Dashboard Santé
**Route:** `/[lang]/superadmin/health`

#### Layout
```
┌─────────────────────────────────────────────────────────┐
│ 🏥 Dashboard Santé                      [🔄 Actualiser] │
│ Surveillance de l'infrastructure en temps réel           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Statut Global: ● Healthy                                 │
│ Dernière vérification: Il y a 2 minutes                  │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Services                                             │ │
│ ├──────────────┬──────────┬──────────┬────────────────┤ │
│ │ Service      │ Statut   │ Latence  │ Dernier check  │ │
│ ├──────────────┼──────────┼──────────┼────────────────┤ │
│ │ 🗄️ S3        │ ● Healthy│ 23ms     │ Il y a 1min    │ │
│ │ 🗃️ Database  │ ● Healthy│ 5ms      │ Il y a 1min    │ │
│ │ 📮 Redis     │ ⚠ Degrad │ 156ms    │ Il y a 1min    │ │
│ │ 📧 SES       │ ● Healthy│ 89ms     │ Il y a 2min    │ │
│ │ 🔍 Meili     │ ● Healthy│ 12ms     │ Il y a 1min    │ │
│ └──────────────┴──────────┴──────────┴────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Graphique de latence (dernières 24h)                 │ │
│ │                                                       │ │
│ │     ╭───────────────────────────────────╮            │ │
│ │ 200 ┤                             ╭─╮   │            │ │
│ │ 150 ┤                         ╭───╯ ╰─╮ │            │ │
│ │ 100 ┤     ╭───╮           ╭───╯       ╰│            │ │
│ │  50 ┤─────╯   ╰───────────╯           │            │ │
│ │   0 ╰───────────────────────────────────╯            │ │
│ │     0h    6h    12h   18h   24h                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Tester tous les services] [Exporter le rapport]        │
└─────────────────────────────────────────────────────────┘
```

#### Features
- **Statut global:** Indicateur visuel du statut général
- **Tableau des services:** Liste avec statut, latence, dernier check
- **Graphiques:** Évolution de la latence sur 24h
- **Auto-refresh:** Rafraîchissement automatique toutes les 30s (configurable)
- **Actions:**
  - Tester tous les services manuellement
  - Exporter un rapport
- **Click sur service:** Ouvre un drawer avec détails

---

### 7. Drawer: Détails d'un Service
**Trigger:** Click sur un service dans le dashboard

#### Layout
```
                                    ┌────────────────────────┐
                                    │ 📮 Redis Cache    [✖]  │
                                    ├────────────────────────┤
                                    │                        │
                                    │ Statut: ⚠ Degraded     │
                                    │ Latence: 156ms         │
                                    │ Dernier check: 1min    │
                                    │                        │
                                    │ ── Métriques ──        │
                                    │ Mémoire: 2.3GB / 4GB   │
                                    │ Connexions: 45 / 100   │
                                    │ Hit rate: 87%          │
                                    │                        │
                                    │ ── Historique ──       │
                                    │ ✓ 12:45 Healthy (12ms) │
                                    │ ⚠ 12:30 Degrad (145ms) │
                                    │ ✓ 12:15 Healthy (8ms)  │
                                    │                        │
                                    │ ── Actions ──          │
                                    │ [Tester maintenant]    │
                                    │ [Reconfigurer]         │
                                    │ [Voir les logs]        │
                                    │                        │
                                    └────────────────────────┘
```

---

## Navigation et Menu

### Structure du Menu SuperAdmin

Mise à jour du fichier `src/modules/SuperAdmin/menu.config.ts` :

```typescript
export const superAdminMenuConfig: ModuleMenuConfig = {
  module: 'SuperAdmin',
  menus: [
    {
      id: 'superadmin-dashboard',
      label: 'Dashboard',
      route: '/superadmin/dashboard',
      icon: { type: 'emoji', value: '📊' },
      order: 1,
      roles: ['superadmin'],
    },
    {
      id: 'superadmin-sites',
      label: 'Sites',
      route: '/superadmin/sites',
      icon: { type: 'emoji', value: '🌐' },
      order: 5,
      roles: ['superadmin'],
    },
    {
      id: 'superadmin-modules',
      label: 'Modules',
      icon: { type: 'emoji', value: '🧩' },
      order: 10,
      roles: ['superadmin'],
      children: [
        {
          id: 'superadmin-modules-list',
          label: 'Tous les modules',
          route: '/superadmin/modules',
          order: 1,
          parentId: 'superadmin-modules',
        },
        {
          id: 'superadmin-modules-dependencies',
          label: 'Dépendances',
          route: '/superadmin/modules/dependencies',
          order: 2,
          parentId: 'superadmin-modules',
        },
      ],
    },
    {
      id: 'superadmin-services',
      label: 'Services',
      icon: { type: 'emoji', value: '⚙️' },
      order: 15,
      roles: ['superadmin'],
      children: [
        {
          id: 'superadmin-services-config',
          label: 'Configuration',
          route: '/superadmin/services/config',
          order: 1,
          parentId: 'superadmin-services',
        },
        {
          id: 'superadmin-services-health',
          label: 'Santé',
          route: '/superadmin/health',
          order: 2,
          parentId: 'superadmin-services',
        },
      ],
    },
    {
      id: 'superadmin-security',
      label: 'Sécurité',
      icon: { type: 'emoji', value: '🔒' },
      order: 20,
      roles: ['superadmin'],
      children: [
        {
          id: 'superadmin-security-audit',
          label: 'Journal d\'audit',
          route: '/superadmin/security/audit',
          order: 1,
          parentId: 'superadmin-security',
        },
      ],
    },
  ],
};
```

---

## Workflows Utilisateur

### Workflow 1: Activer un Module pour un Tenant

**Scénario:** Le SuperAdmin veut activer le module "Commerce" pour le site "example.com"

**Étapes:**
1. Navigation vers Sites → example.com → Modules
2. Recherche "Commerce" dans la liste des modules disponibles
3. Click sur bouton "Activer" (icône +)
4. **Assistant d'activation s'ouvre:**
   - **Step 1:** Validation des informations du module
   - **Step 2:** Vérification automatique des dépendances
     - Si dépendances manquantes → Option d'installation auto
   - **Step 3:** Configuration optionnelle (champs spécifiques au module)
   - **Step 4:** Confirmation et lancement
5. **Exécution de l'activation:**
   - Affichage en temps réel des étapes Saga
   - Progress bar
   - Messages de succès/erreur
6. **Résultat:**
   - Si succès → Module apparaît dans "Modules Actifs"
   - Si échec → Affichage de l'erreur + option de rollback
   - Notification toast de confirmation

### Workflow 2: Analyser l'Impact avant Désactivation

**Scénario:** Le SuperAdmin veut désactiver le module "Payment" mais veut d'abord voir l'impact

**Étapes:**
1. Navigation vers Sites → example.com → Modules
2. Localisation du module "Payment" dans les modules actifs
3. Click sur bouton "Désactiver" (icône ✖)
4. **Modal d'analyse d'impact s'ouvre:**
   - Calcul automatique de l'impact
   - Affichage des résultats:
     - ⚠ Modules dépendants: "Commerce", "Invoicing"
     - ⚠ Données affectées: 3 tables, ~1500 lignes
     - ✓ Blockers: Aucun
5. **Options présentées:**
   - ☑ Créer un backup S3 avant désactivation
   - ☐ Forcer la désactivation (ignore les avertissements)
6. **Confirmation:**
   - Bouton "Confirmer la désactivation" (désactivé si blockers)
   - Bouton "Annuler"
7. **Exécution si confirmé:**
   - Backup des données
   - Rollback des migrations
   - Désactivation du module
   - Mise à jour du statut
8. **Résultat:**
   - Module déplacé vers "Modules Disponibles"
   - Notification avec lien vers le backup S3

### Workflow 3: Configurer un Service (S3/MinIO)

**Scénario:** Le SuperAdmin configure le service S3 pour la première fois

**Étapes:**
1. Navigation vers Services → Configuration
2. Click sur carte "S3" → Bouton "Configurer"
3. **Formulaire de configuration:**
   - Remplissage des champs (endpoint, région, bucket, clés)
4. **Test de connexion:**
   - Click sur "Tester la connexion"
   - Validation côté client (champs requis)
   - Envoi de la requête au backend
   - Affichage du résultat:
     - ✓ Succès → Message de confirmation + latence
     - ✗ Échec → Message d'erreur détaillé
5. **Sauvegarde:**
   - Click sur "Enregistrer"
   - Chiffrement automatique des secrets côté backend
   - Notification de succès
6. **Retour au dashboard:**
   - Carte S3 maintenant marquée "✓ Configuré" + "● Healthy"

### Workflow 4: Surveiller la Santé des Services

**Scénario:** Le SuperAdmin veut vérifier l'état de l'infrastructure

**Étapes:**
1. Navigation vers Services → Santé
2. **Dashboard de santé s'affiche:**
   - Statut global visible immédiatement
   - Liste des services avec statut individuel
   - Graphiques de latence
3. **Auto-refresh actif (30s):**
   - Indicateur visuel de rafraîchissement
4. **Investigation d'un problème:**
   - Click sur service "Redis" (status ⚠ Degraded)
   - **Drawer s'ouvre avec détails:**
     - Métriques détaillées
     - Historique des checks
     - Message d'erreur si applicable
5. **Actions correctives:**
   - Click sur "Reconfigurer" → Redirige vers formulaire config
   - Ou "Tester maintenant" → Force un nouveau check
6. **Export de rapport:**
   - Click sur "Exporter le rapport"
   - Génération d'un PDF/CSV avec historique

---

## Prochaines Étapes d'Implémentation

### Phase 1: Fondations (Semaine 1-2)
- [ ] Créer la structure modulaire `src/modules/SuperAdmin/`
- [ ] Définir tous les types TypeScript
- [ ] Créer les services API de base (ModuleService, HealthService)
- [ ] Implémenter les hooks de base (useModules, useServiceHealth)

### Phase 2: Gestion des Modules (Semaine 3-4)
- [ ] Page: Liste des modules
- [ ] Page: Modules par tenant
- [ ] Composant: ModuleCard
- [ ] Modal: Assistant d'activation
- [ ] Modal: Analyse d'impact désactivation

### Phase 3: Configuration Services (Semaine 5-6)
- [ ] Page: Dashboard configuration
- [ ] Formulaires de config pour chaque service:
  - [ ] S3/MinIO
  - [ ] Database
  - [ ] Redis Cache
  - [ ] Redis Queue
  - [ ] Amazon SES
  - [ ] Meilisearch
- [ ] Composant: ServiceConfigForm (générique)
- [ ] Tests de connexion

### Phase 4: Dashboard Santé (Semaine 7-8)
- [ ] Page: Dashboard santé
- [ ] Composant: ServiceHealthCard
- [ ] Drawer: Détails service
- [ ] Graphiques de performance
- [ ] Auto-refresh
- [ ] Export de rapports

### Phase 5: Fonctionnalités Avancées (Semaine 9-10)
- [ ] Graphe de dépendances (react-flow)
- [ ] Activation par lot
- [ ] Journal d'audit
- [ ] Notifications en temps réel (websockets?)
- [ ] Thèmes et personnalisation

### Phase 6: Tests et Optimisation (Semaine 11-12)
- [ ] Tests unitaires (Jest + React Testing Library)
- [ ] Tests d'intégration
- [ ] Optimisation des performances
- [ ] Accessibilité (a11y)
- [ ] Documentation utilisateur

---

## Notes Techniques

### Gestion d'État
- **Local state:** useState pour état de composant simple
- **Server state:** React Query/SWR pour caching et synchronisation API
- **Global state:** Redux Toolkit si nécessaire (ex: user auth, notifications)

### Optimisations
- **Code splitting:** Lazy loading des pages avec next/dynamic
- **Memoization:** useMemo/useCallback pour éviter re-renders
- **Virtualization:** react-window pour grandes listes
- **Debouncing:** Pour recherches et filtres

### Sécurité
- **Validation côté client:** Yup/Zod pour tous les formulaires
- **Masquage des secrets:** Ne jamais afficher les secrets en clair
- **CSRF protection:** Tokens CSRF pour toutes les mutations
- **Rate limiting:** Respecter les limites backend

### Accessibilité
- **ARIA labels:** Sur tous les éléments interactifs
- **Keyboard navigation:** Tab, Enter, Escape fonctionnels
- **Screen readers:** Textes alternatifs et descriptions
- **Contraste:** Respecter WCAG 2.1 AA

### i18n
- **Clés de traduction:** Toutes les chaînes via dictionnaires
- **Format des dates:** date-fns avec locale appropriée
- **Support RTL:** Pour l'arabe (déjà configuré)

---

## Conclusion

Cette proposition couvre l'ensemble des fonctionnalités backend implémentées dans vos 6 epics. L'architecture modulaire proposée est cohérente avec votre stack NextJS/MUI existante et s'intègre parfaitement avec le backend Laravel.

**Points forts:**
- Architecture modulaire et scalable
- Composants réutilisables
- Workflows utilisateur intuitifs
- Types TypeScript complets
- Intégration complète avec les APIs backend

**Prochaine action recommandée:**
Commencer par la **Phase 1 (Fondations)** en créant la structure de base, les types et les services API. Cela permettra ensuite d'itérer rapidement sur les composants UI.

---

**Questions ou ajustements souhaités?** N'hésitez pas à me faire part de vos retours pour affiner cette proposition.
