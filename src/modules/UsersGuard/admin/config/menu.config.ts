/**
 * Menu configuration for UsersGuard module
 *
 * NOTE: This file is kept for reference only.
 * Menus are now managed via the Dashboard module and stored in the Laravel backend.
 * Create these menus via the admin interface at /admin/settings/menus
 */

// Legacy type definition for reference
type ModuleMenuConfig = {
  module: string;
  menuItems?: any[];
  settingsItems?: any[];
};

export const usersGuardMenuConfig: ModuleMenuConfig = {
  module: 'UsersGuard',

  // Main menu items (appear in sidebar)
  menuItems: [
    {
      id: 'users',
      label: 'Utilisateurs',
      path: '/admin/users',
      icon: {
        type: 'emoji',
        value: '👥',
      },
      order: 10,
      module: 'UsersGuard',
      // permission: ['users.view'], // Décommenter pour activer les permissions
    },
    {
      id: 'roles',
      label: 'Rôles & Permissions',
      path: '/admin/roles',
      icon: {
        type: 'emoji',
        value: '🔐',
      },
      order: 20,
      module: 'UsersGuard',
      // permission: ['roles.view'], // Décommenter pour activer les permissions
    },
  ],

  // Settings submenu items (appear in settings page)
  settingsItems: [
    {
      id: 'settings-auth',
      label: 'Authentification',
      description: 'Configurer les paramètres d\'authentification et de sécurité',
      path: '/admin/settings/auth',
      icon: {
        type: 'emoji',
        value: '🔒',
      },
      order: 10,
      category: 'Sécurité',
      module: 'UsersGuard',
      // permission: ['settings.auth.manage'], // Décommenter pour activer les permissions
    },
    {
      id: 'settings-password-policy',
      label: 'Politique de mot de passe',
      description: 'Définir les règles de complexité des mots de passe',
      path: '/admin/settings/password-policy',
      icon: {
        type: 'emoji',
        value: '🔑',
      },
      order: 20,
      category: 'Sécurité',
      module: 'UsersGuard',
      // permission: ['settings.security.manage'], // Décommenter pour activer les permissions
    },
    {
      id: 'settings-sessions',
      label: 'Sessions',
      description: 'Gérer les sessions actives et les délais d\'expiration',
      path: '/admin/settings/sessions',
      icon: {
        type: 'emoji',
        value: '⏱️',
      },
      order: 30,
      category: 'Sécurité',
      module: 'UsersGuard',
      // permission: ['settings.security.manage'], // Décommenter pour activer les permissions
    },
  ],
};
