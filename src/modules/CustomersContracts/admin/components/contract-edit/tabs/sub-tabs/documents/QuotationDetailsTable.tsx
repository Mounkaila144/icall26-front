'use client'

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

import type { DomoprimeQuotation } from '@/modules/AppDomoprime/types'
import type { ContractTranslations } from '../../../../../hooks/useContractTranslations'

import { formatCurrency } from './helpers'

interface QuotationDetailsTableProps {
  quotations: DomoprimeQuotation[]
  downloading: string | null
  onDownloadPdf: (id: number, ref: string) => void
  onDownloadSignedPdf: (id: number, ref: string) => void
  t: ContractTranslations
}

export default function QuotationDetailsTable({
  quotations,
  downloading,
  onDownloadPdf,
  onDownloadSignedPdf,
  t,
}: QuotationDetailsTableProps) {
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
            <TableCell align='right'>{t.docColPrimeCee}</TableCell>
            <TableCell>{t.docColSigned}</TableCell>
            <TableCell>{t.docColSignedAt}</TableCell>
            <TableCell>{t.docColStatus}</TableCell>
            <TableCell align='center'>{t.docColActions}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quotations.map((q, idx) => (
            <TableRow key={q.id} selected={q.is_last === 'YES'}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{q.reference}</TableCell>
              <TableCell>{q.dated_at ?? '-'}</TableCell>
              <TableCell align='right'>{formatCurrency(q.total_sale_without_tax)}</TableCell>
              <TableCell align='right'>{formatCurrency(q.total_sale_with_tax)}</TableCell>
              <TableCell align='right'>{formatCurrency(q.cee_prime)}</TableCell>
              <TableCell>
                <Chip
                  label={q.is_signed === 'YES' ? t.docSigned : t.docNotSigned}
                  size='small'
                  color={q.is_signed === 'YES' ? 'success' : 'default'}
                  variant='outlined'
                />
              </TableCell>
              <TableCell>{q.signed_at ?? '-'}</TableCell>
              <TableCell>
                <Chip
                  label={q.status}
                  size='small'
                  color={q.status === 'ACTIVE' ? 'success' : 'error'}
                />
              </TableCell>
              <TableCell align='center'>
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                  <Tooltip title={t.docDownloadPdf}>
                    <IconButton
                      size='small'
                      color='primary'
                      disabled={downloading === `pdf-${q.id}`}
                      onClick={() => onDownloadPdf(q.id, q.reference)}
                    >
                      {downloading === `pdf-${q.id}`
                        ? <CircularProgress size={14} />
                        : <i className='ri-file-download-line' style={{ fontSize: 16 }} />
                      }
                    </IconButton>
                  </Tooltip>
                  {q.is_signed === 'YES' ? (
                    <Tooltip title={t.docDownloadSigned}>
                      <IconButton
                        size='small'
                        color='success'
                        disabled={downloading === `signed-${q.id}`}
                        onClick={() => onDownloadSignedPdf(q.id, q.reference)}
                      >
                        {downloading === `signed-${q.id}`
                          ? <CircularProgress size={14} />
                          : <i className='ri-file-shield-2-line' style={{ fontSize: 16 }} />
                        }
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
