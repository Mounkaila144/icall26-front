'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/UsersGuard/superadmin/hooks/useAuth';
import { RedisQueueConfigPage } from '@/modules/SuperAdmin';
import { Box, CircularProgress } from '@mui/material';

/**
 * Page de configuration Redis Queue
 * Route: /[lang]/superadmin/services/redis-queue
 */
export default function RedisQueueConfigPageRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/superadmin/login');
    }
  }, [isAuthenticated, authLoading, router]);

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

  if (!isAuthenticated) {
    return null;
  }

  return <RedisQueueConfigPage />;
}
