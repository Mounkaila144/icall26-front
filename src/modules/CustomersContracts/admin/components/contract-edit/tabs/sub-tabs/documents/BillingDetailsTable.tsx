'use client'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'

import type { DomoprimeBilling } from '@/modules/AppDomoprime/types'
import type { ContractTranslations } from '../../../../../hooks/useContractTranslations'

import { formatCurrency } from './helpers'

interface BillingDetailsTableProps {
  billings: DomoprimeBilling[]
  t: ContractTranslations
}

export default function BillingDetailsTable({
  billings,
  t,
}: BillingDetailsTableProps) {
  return (
    <TableContainer>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>{t.docColReference}</TableCell>
            <TableCell>{t.docColDate}</TableCell>
            <TableCell align='right'>{t.docColTotalHt}</TableCell>
            <TableCell align='right'>{t.docColTotalTtc}</TableCell>
            <TableCell>{t.docColStatus}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {billings.map((b, idx) => (
            <TableRow key={b.id} selected={b.is_last === 'YES'}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{b.reference}</TableCell>
              <TableCell>{b.dated_at ?? '-'}</TableCell>
              <TableCell align='right'>{formatCurrency(b.total_sale_without_tax)}</TableCell>
              <TableCell align='right'>{formatCurrency(b.total_sale_with_tax)}</TableCell>
              <TableCell>
                <Chip
                  label={b.status}
                  size='small'
                  color={b.status === 'ACTIVE' ? 'success' : 'error'}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
