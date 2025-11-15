/**
 * Component Registry
 *
 * Central registry for all dynamically loadable components
 * This is required because Next.js webpack cannot resolve dynamic imports with template literals
 */

import { ComponentType } from 'react'

// Import all admin components
import CustomersComponent from '@/modules/Customers/admin/components/Customers'
import CustomersContractsList1 from '@/modules/CustomersContracts/admin/components/ContractsList1'
import { UsersList } from '@/modules/Users/admin/components/UsersList'

/**
 * Registry mapping module:component to actual component
 */
export const adminComponentRegistry: Record<string, ComponentType<any>> = {
  // Customers module
  'Customers:Customers': CustomersComponent,

  // CustomersContracts module
  'CustomersContracts:ContractsList1': CustomersContractsList1,

  // Users module
  'Users:UsersList': UsersList,
}

/**
 * Registry mapping module:component to actual component for superadmin
 */
export const superadminComponentRegistry: Record<string, ComponentType<any>> = {
  // Add superadmin components here as needed
}

/**
 * Get component from registry
 */
export function getComponent(moduleName: string, componentName: string, context: 'admin' | 'superadmin' = 'admin'): ComponentType<any> | null {
  const key = `${moduleName}:${componentName}`
  const registry = context === 'admin' ? adminComponentRegistry : superadminComponentRegistry

  return registry[key] || null
}
