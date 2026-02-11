import IconButton from '@mui/material/IconButton'

import { Can } from '@/shared/components/permissions'

interface ContractActionsCellProps {
  contractId: number
  reference: string
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

export default function ContractActionsCell({ contractId, reference, onEdit, onDelete }: ContractActionsCellProps) {
  return (
    <div className='flex items-center gap-0.5'>
      <Can credential={[['superadmin', 'admin', 'contract_view']]}>
        <IconButton size='small' onClick={() => window.open(`/admin/contracts/${contractId}`, '_blank')}>
          <i className='ri-eye-line' />
        </IconButton>
      </Can>
      <Can credential={[['superadmin', 'admin', 'contract_modify']]}>
        <IconButton size='small' onClick={() => onEdit(contractId)} color='primary'>
          <i className='ri-edit-box-line' />
        </IconButton>
      </Can>
      <Can credential={[['superadmin', 'admin']]}>
        <IconButton size='small' onClick={() => onDelete(contractId)} color='error'>
          <i className='ri-delete-bin-7-line' />
        </IconButton>
      </Can>
      <Can credential={[['superadmin', 'admin', 'contract_copy']]}>
        <IconButton size='small' onClick={() => navigator.clipboard.writeText(reference)}>
          <i className='ri-file-copy-line' />
        </IconButton>
      </Can>
    </div>
  )
}
