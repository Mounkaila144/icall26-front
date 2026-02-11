import { useState, useCallback } from 'react'

import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'

import { usePermissions } from '@/shared/contexts/PermissionsContext'

interface ContractActionsCellProps {
  contractId: number
  reference: string
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

export default function ContractActionsCell({ contractId, reference, onEdit, onDelete }: ContractActionsCellProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { hasCredential } = usePermissions()

  const handleOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const canView = hasCredential([['superadmin', 'admin', 'contract_view']])
  const canEdit = hasCredential([['superadmin', 'admin', 'contract_modify']])
  const canDelete = hasCredential([['superadmin', 'admin']])
  const canCopy = hasCredential([['superadmin', 'admin', 'contract_copy']])

  return (
    <>
      <IconButton size='small' onClick={handleOpen}>
        <i className='ri-more-2-fill' />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { minWidth: 160, py: 0.5 },
          },
        }}
      >
        {canView && (
          <MenuItem
            onClick={() => { handleClose(); window.open(`/admin/contracts/${contractId}`, '_blank') }}
            sx={{ fontSize: '0.875rem' }}
          >
            <ListItemIcon><i className='ri-eye-line' style={{ fontSize: '1.125rem' }} /></ListItemIcon>
            <ListItemText>Voir</ListItemText>
          </MenuItem>
        )}
        {canEdit && (
          <MenuItem
            onClick={() => { handleClose(); onEdit(contractId) }}
            sx={{ fontSize: '0.875rem', color: 'primary.main' }}
          >
            <ListItemIcon><i className='ri-edit-box-line' style={{ fontSize: '1.125rem', color: 'inherit' }} /></ListItemIcon>
            <ListItemText>Modifier</ListItemText>
          </MenuItem>
        )}
        {canCopy && (
          <MenuItem
            onClick={() => { handleClose(); navigator.clipboard.writeText(reference) }}
            sx={{ fontSize: '0.875rem' }}
          >
            <ListItemIcon><i className='ri-file-copy-line' style={{ fontSize: '1.125rem' }} /></ListItemIcon>
            <ListItemText>Copier réf.</ListItemText>
          </MenuItem>
        )}
        {canDelete && [
          <Divider key='divider' />,
          <MenuItem
            key='delete'
            onClick={() => { handleClose(); onDelete(contractId) }}
            sx={{ fontSize: '0.875rem', color: 'error.main' }}
          >
            <ListItemIcon><i className='ri-delete-bin-7-line' style={{ fontSize: '1.125rem', color: 'inherit' }} /></ListItemIcon>
            <ListItemText>Supprimer</ListItemText>
          </MenuItem>,
        ]}
      </Menu>
    </>
  )
}
