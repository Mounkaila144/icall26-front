import { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Users Module Menu Configuration
 *
 * This file defines all menu items for the Users (Authentication) module.
 */
export const usersGuardMenuConfig: ModuleMenuConfig = {
  module: 'Users',
  menus: [
    {
      id: 'users',
      label: 'Users',
        route: '/admin/users',
      icon: {
        type: 'emoji',
        value: '👥',
      },
      order: 10,
      module: 'Users',
      isVisible: true,
      isActive: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: {
        type: 'emoji',
        value: '⚙️',
      },
      order: 100,
      module: 'Users',
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'settings-auth',
          label: 'Authentication',
          route: '/admin/settings/auth',
          order: 1,
          module: 'Users',
          parentId: 'settings',
          isVisible: true,
          isActive: true,
        },
        {
          id: 'settings-password-policy',
          label: 'Password Policy',
          route: '/admin/settings/password-policy',
          order: 2,
          module: 'Users',
          parentId: 'settings',
          isVisible: true,
          isActive: true,
        },
        {
          id: 'settings-sessions',
          label: 'Sessions',
          route: '/admin/settings/sessions',
          order: 3,
          module: 'Users',
          parentId: 'settings',
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
