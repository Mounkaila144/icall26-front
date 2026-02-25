import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

export const AppDomoprimeMenuConfig: ModuleMenuConfig = {
  module: 'AppDomoprime',
  menus: [
    {
      id: 'Domoprime',
      label: 'Domoprime',
      route: '/admin/AppDomoprime/Domoprime',
      icon: {
        type: 'emoji',
        value: '🏠',
      },
      order: 30,
      module: 'AppDomoprime',
      roles: ['admin'],
      isVisible: true,
      isActive: true,
    },
  ],
};
