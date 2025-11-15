'use client'

/**
 * Permissions Context
 *
 * Provides global permissions state management for the application
 * Compatible with Symfony 1 hasCredential() behavior
 * NO additional API requests after login - all permissions cached locally
 *
 * @module PermissionsContext
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  UserPermissions,
  loadPermissionsFromStorage,
  savePermissionsToStorage,
  clearPermissionsFromStorage
} from '@/shared/lib/permissions/extractPermissions'

interface PermissionsContextType {
  /** Current user permissions or null if not loaded */
  permissions: UserPermissions | null
  /** Loading state during initialization */
  loading: boolean
  /** Check if user has a credential (group OR permission) - Symfony 1 style */
  hasCredential: (credential: string | string[] | string[][], requireAll?: boolean) => boolean
  /** Check if user belongs to a group */
  hasGroup: (group: string) => boolean
  /** Check if user is superadmin */
  isSuperadmin: () => boolean
  /** Check if user is admin (or superadmin) */
  isAdmin: () => boolean
  /** Set permissions (called after login) */
  setPermissions: (permissions: UserPermissions) => void
  /** Clear permissions (called on logout) */
  clearPermissions: () => void
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

/**
 * Permissions Provider Component
 *
 * Wraps the application to provide global permissions state
 * Automatically loads permissions from localStorage on mount
 *
 * @example
 * ```tsx
 * // In app/admin/layout.tsx
 * import { PermissionsProvider } from '@/shared/contexts/PermissionsContext'
 *
 * export default function AdminLayout({ children }) {
 *   return (
 *     <PermissionsProvider>
 *       {children}
 *     </PermissionsProvider>
 *   )
 * }
 * ```
 */
export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissionsState] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)

  // Au montage du composant, charger depuis localStorage
  useEffect(() => {
    const stored = loadPermissionsFromStorage()
    if (stored) {
      setPermissionsState(stored)
    }
    setLoading(false)
  }, [])

  // Sauvegarder dans localStorage à chaque changement
  const setPermissions = (perms: UserPermissions) => {
    setPermissionsState(perms)
    savePermissionsToStorage(perms)
  }

  // Effacer les permissions (au logout)
  const clearPermissions = () => {
    setPermissionsState(null)
    clearPermissionsFromStorage()
  }

  /**
   * Vérifie si l'utilisateur a un credential (groupe OU permission) - Style Symfony 1
   *
   * Supporte plusieurs syntaxes :
   * - String simple: hasCredential('admin')
   * - Array simple (OR): hasCredential(['admin', 'superadmin'])
   * - Array imbriqué Symfony (OR): hasCredential([['admin', 'superadmin']])
   * - AND logic: hasCredential(['perm1', 'perm2'], true)
   *
   * @param credential Le ou les credentials à vérifier
   * @param requireAll Si true, tous les credentials doivent être présents (AND logic)
   * @returns true si l'utilisateur a le(s) credential(s)
   *
   * @example
   * ```typescript
   * // Vérifier un seul credential (groupe OU permission)
   * hasCredential('admin') // true si user a le groupe "admin" OU la permission "admin"
   *
   * // Vérifier plusieurs credentials (OR logic) - Style Symfony 1
   * hasCredential([['admin', 'superadmin', 'users.edit']]) // true si AU MOINS UN est présent
   *
   * // Vérifier plusieurs credentials (AND logic)
   * hasCredential(['users.view', 'users.edit'], true) // true si TOUS sont présents
   * ```
   */
  const hasCredential = (
    credential: string | string[] | string[][],
    requireAll = false
  ): boolean => {
    if (!permissions) return false
    if (permissions.is_superadmin) return true

    // Helper: vérifier un credential simple (groupe OU permission)
    const checkSingle = (cred: string): boolean => {
      // D'abord vérifier dans les groupes
      if (permissions.groups.includes(cred)) return true
      // Puis dans les permissions
      return permissions.permissions.includes(cred)
    }

    // 1. String simple
    if (typeof credential === 'string') {
      return checkSingle(credential)
    }

    // 2. Array imbriqué Symfony style: [['admin', 'superadmin']] = OR logic
    if (Array.isArray(credential) && credential.length > 0 && Array.isArray(credential[0])) {
      return credential.some(group =>
        Array.isArray(group) && group.some(c => checkSingle(c))
      )
    }

    // 3. Array simple
    if (Array.isArray(credential)) {
      if (requireAll) {
        // AND logic: doit avoir TOUS les credentials
        return credential.every(c => checkSingle(c))
      } else {
        // OR logic: doit avoir AU MOINS UN credential
        return credential.some(c => checkSingle(c))
      }
    }

    return false
  }

  /**
   * Vérifie si l'utilisateur appartient à un groupe
   *
   * @param group Le nom du groupe à vérifier
   * @returns true si l'utilisateur appartient au groupe
   *
   * @example
   * ```typescript
   * hasGroup('1-FIDEALIS') // true si user appartient au groupe "1-FIDEALIS"
   * hasGroup('admin') // true si user appartient au groupe "admin"
   * ```
   */
  const hasGroup = (group: string): boolean => {
    if (!permissions) return false
    return permissions.groups.includes(group)
  }

  /**
   * Vérifie si l'utilisateur est superadmin
   *
   * @returns true si l'utilisateur est superadmin
   *
   * @example
   * ```typescript
   * if (isSuperadmin()) {
   *   console.log('User has full access')
   * }
   * ```
   */
  const isSuperadmin = (): boolean => {
    return permissions?.is_superadmin ?? false
  }

  /**
   * Vérifie si l'utilisateur est admin (ou superadmin)
   *
   * @returns true si l'utilisateur est admin ou superadmin
   *
   * @example
   * ```typescript
   * if (isAdmin()) {
   *   console.log('User has admin access')
   * }
   * ```
   */
  const isAdmin = (): boolean => {
    return permissions?.is_admin ?? false
  }

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        loading,
        hasCredential,
        hasGroup,
        isSuperadmin,
        isAdmin,
        setPermissions,
        clearPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

/**
 * Hook to access permissions context
 *
 * Must be used within a PermissionsProvider
 *
 * @throws Error if used outside PermissionsProvider
 * @returns Permissions context with all helper functions
 *
 * @example
 * ```typescript
 * import { usePermissions } from '@/shared/contexts/PermissionsContext'
 *
 * function MyComponent() {
 *   const { hasCredential, hasGroup, permissions } = usePermissions()
 *
 *   if (hasCredential('admin')) {
 *     return <AdminPanel />
 *   }
 *
 *   return <UserPanel />
 * }
 * ```
 */
export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider')
  }
  return context
}

/**
 * Hook to access permissions context (optional)
 *
 * Returns null if used outside PermissionsProvider (does not throw error)
 * Useful for components that may or may not have permissions available
 *
 * @returns Permissions context or null
 *
 * @example
 * ```typescript
 * import { usePermissionsOptional } from '@/shared/contexts/PermissionsContext'
 *
 * function MyComponent() {
 *   const permissions = usePermissionsOptional()
 *
 *   if (!permissions) {
 *     return <div>Loading permissions...</div>
 *   }
 *
 *   return <div>Permissions loaded</div>
 * }
 * ```
 */
export function usePermissionsOptional() {
  return useContext(PermissionsContext)
}
