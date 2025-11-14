import { ModuleMenuConfig } from '@/src/shared/types/menu-config.types';

/**
 * Dashboard Module Menu Configuration
 *
 * This file defines all menu items for the Dashboard module.
 * Menus are displayed in the admin sidebar.
 */
export const dashboardMenuConfig: ModuleMenuConfig = {
  module: 'Dashboard',
  menus: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: {
        type: 'emoji',
        value: '📊',
      },
      order: 1,
      module: 'Dashboard',
      isVisible: true,
      isActive: true,
    },

  ],
};
