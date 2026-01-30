'use client';

import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Chip, Avatar, IconButton, Tooltip, Box, Stack, Typography } from '@mui/material';
import { DataTable } from '@/components/shared/DataTable/DataTable';
import type { Module } from '../../../types/module.types';

/**
 * Props du composant ModulesTable
 */
interface ModulesTableProps {
  /** Liste des modules à afficher */
  modules: Module[];
  /** Indique si les données sont en cours de chargement */
  loading?: boolean;
  /** Callback appelé lors du clic sur "Voir détails" */
  onViewDetails?: (module: Module) => void;
}

/**
 * Obtenir la couleur du chip selon la catégorie
 */
const getCategoryColor = (category: string): 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
  switch (category) {
    case 'core':
      return 'primary';
    case 'business':
      return 'success';
    case 'integration':
      return 'info';
    case 'ui':
      return 'secondary';
    case 'utility':
      return 'warning';
    default:
      return 'primary';
  }
};

/**
 * Composant tableau de modules avec recherche, tri et pagination
 *
 * @example
 * ```tsx
 * <ModulesTable
 *   modules={modules}
 *   loading={loading}
 *   onViewDetails={(module) => console.log(module)}
 * />
 * ```
 */
export function ModulesTable({ modules, loading = false, onViewDetails }: ModulesTableProps) {
  // Définition des colonnes
  const columns = useMemo<ColumnDef<Module>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'displayName',
        header: 'Nom',
        cell: ({ row }) => {
          const module = row.original;
          const avatarContent = module.icon || module.displayName.charAt(0).toUpperCase();

          return (
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: module.enabled ? 'primary.main' : 'grey.400',
                  width: 36,
                  height: 36,
                }}
              >
                {avatarContent}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {module.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {module.name}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        id: 'category',
        accessorKey: 'category',
        header: 'Catégorie',
        cell: ({ row }) => (
          <Chip
            label={row.original.category}
            color={getCategoryColor(row.original.category)}
            size="small"
          />
        ),
      },
      {
        id: 'version',
        accessorKey: 'version',
        header: 'Version',
        cell: ({ getValue }) => (
          <Typography variant="body2" fontFamily="monospace">
            v{getValue() as string}
          </Typography>
        ),
      },
      {
        id: 'status',
        accessorKey: 'enabled',
        header: 'Statut',
        cell: ({ getValue }) => {
          const enabled = getValue() as boolean;
          return (
            <Chip
              label={enabled ? 'Activé' : 'Désactivé'}
              color={enabled ? 'success' : 'default'}
              size="small"
              variant={enabled ? 'filled' : 'outlined'}
            />
          );
        },
      },
      {
        id: 'dependencies',
        accessorKey: 'dependencies',
        header: 'Dépendances',
        cell: ({ getValue }) => {
          const deps = getValue() as string[];
          return (
            <Typography variant="body2" color="text.secondary">
              {deps.length > 0 ? `${deps.length}` : 'Aucune'}
            </Typography>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Tooltip title="Voir les détails">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onViewDetails?.(row.original)}
            >
              <i className="tabler-eye" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [onViewDetails]
  );

  return (
    <DataTable
      columns={columns}
      data={modules}
      loading={loading}
      searchPlaceholder="Rechercher un module..."
      emptyMessage="Aucun module trouvé"
      rowsPerPageOptions={[10, 25, 50]}
      pagination={{
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: modules.length,
      }}
    />
  );
}
