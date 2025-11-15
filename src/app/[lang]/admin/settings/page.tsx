'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/modules/UsersGuard';

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const settingsCategories = [
    {
      title: 'Gestion des Menus',
      description: 'Gérer les menus de navigation de l\'application',
      icon: '📋',
      path: '/admin/settings/menus',
    },
    {
      title: 'Authentification',
      description: 'Configurer les paramètres d\'authentification et de sécurité',
      icon: '🔒',
      path: '/admin/settings/auth',
    },
    {
      title: 'Politique de mot de passe',
      description: 'Définir les règles de complexité des mots de passe',
      icon: '🔑',
      path: '/admin/settings/password-policy',
    },
    {
      title: 'Sessions',
      description: 'Gérer les sessions actives et les délais d\'expiration',
      icon: '⏱️',
      path: '/admin/settings/sessions',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Paramètres</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsCategories.map((category) => (
              <Link
                key={category.path}
                href={category.path}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start">
                  <span className="text-3xl mr-4">{category.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
