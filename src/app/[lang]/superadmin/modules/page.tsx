'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/UsersGuard/superadmin/hooks/useAuth';
import { ModulesPage } from '@/modules/SuperAdmin/superadmin/components/modules/ModulesPage';
import { Box, CircularProgress } from '@mui/material';

/**
 * Page de gestion des modules SuperAdmin
 * Route: /[lang]/superadmin/modules
 */
export default function ModulesPageRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Vérification de l'authentification
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/superadmin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // État de chargement de l'authentification
  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={48} />
          <p style={{ marginTop: '1rem', color: '#666' }}>Chargement...</p>
        </Box>
      </Box>
    );
  }

  // Si non authentifié, ne rien afficher (la redirection est en cours)
  if (!isAuthenticated) {
    return null;
  }

  // Afficher la page des modules si authentifié
  return <ModulesPage />;
}
