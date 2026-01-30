'use client';

import { useEffect } from 'react';

import { useRouter, useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

/**
 * Page catch-all pour les routes SuperAdmin non définies
 * Redirige vers le dashboard ou affiche une page 404
 */
export default function SuperAdminCatchAllPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] | undefined;

  useEffect(() => {
    // Rediriger vers le dashboard après un court délai
    const timer = setTimeout(() => {
      router.push('/superadmin/sites');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="h6" color="text.secondary">
        Page non trouvée
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Redirection vers le dashboard...
      </Typography>
      {slug && (
        <Typography variant="caption" color="text.disabled">
          Route: /superadmin/{slug.join('/')}
        </Typography>
      )}
    </Box>
  );
}
