'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { HealthDashboard } from '@/modules/SuperAdmin/superadmin/components/health';

/**
 * Page Dashboard SuperAdmin
 * Affiche le dashboard de santé globale du système
 * Conforme à l'Epic 6 - Dashboard Santé Globale UI
 */
const DashboardSuperAdmin = () => {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;

  /**
   * Gère le clic sur un tenant pour ouvrir la gestion des modules
   */
  const handleTenantClick = (tenantId: number) => {
    // Naviguer vers la page des sites avec le modal ouvert pour ce tenant
    router.push(`/${lang}/superadmin/sites?tenant=${tenantId}`);
  };

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link href={`/${lang}/superadmin`} color="inherit" underline="hover">
            SuperAdmin
          </Link>
          <Typography color="text.primary">Dashboard</Typography>
        </Breadcrumbs>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Santé Globale
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vue d'ensemble de l'état du système, des modules et des tenants
        </Typography>
      </Box>

      {/* Dashboard de santé */}
      <HealthDashboard
        onTenantClick={handleTenantClick}
        autoRefresh
        refreshInterval={60000}
      />
    </Box>
  );
};

export default DashboardSuperAdmin;
