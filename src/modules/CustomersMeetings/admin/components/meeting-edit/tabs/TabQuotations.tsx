'use client'

import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'

import { apiClient } from '@/shared/lib/api-client'
import type { MeetingTranslations } from '../../../hooks/useMeetingTranslations'

interface TabQuotationsProps {
  meetingId: number | null
  t: MeetingTranslations
}

interface Quotation {
  id: number
  reference?: string
  status?: string
  total_ht?: number
  total_ttc?: number
  created_at?: string
  creator?: { id: number; firstname: string; lastname: string } | null
  subvention_type?: { id: number; name: string } | null
}

export default function TabQuotations({ meetingId, t }: TabQuotationsProps) {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tR = t as Record<string, string>

  const loadQuotations = useCallback(async () => {
    if (!meetingId) return
    setLoading(true)
    setError(null)

    try {
      const res = await apiClient.get<{ success: boolean; data: { quotations: Quotation[] } }>(
        `/admin/appdomoprime-iso3/meetings/${meetingId}/quotations`,
      )

      if (res.data.success) {
        setQuotations(res.data.data.quotations ?? [])
      }
    } catch {
      setError(tR.tabQuotationsLoadError ?? 'Erreur lors du chargement des devis')
    } finally {
      setLoading(false)
    }
  }, [meetingId, tR.tabQuotationsLoadError])

  useEffect(() => {
    loadQuotations()
  }, [loadQuotations])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {error ? (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <IconButton onClick={loadQuotations} size='small' title='Refresh'>
          <i className='ri-refresh-line' />
        </IconButton>
      </Box>

      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{tR.tabReference ?? 'Référence'}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{tR.tabDate ?? 'Date'}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{tR.tabTotalHT ?? 'Total HT'}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{tR.tabTotalTTC ?? 'Total TTC'}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{tR.tabSubventionType ?? 'Type subvention'}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{tR.tabStatus ?? 'Statut'}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{tR.tabCreator ?? 'Créateur'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align='center' sx={{ py: 4, color: 'text.secondary' }}>
                  {tR.tabNoQuotations ?? 'Aucun devis'}
                </TableCell>
              </TableRow>
            ) : (
              quotations.map((q, index) => (
                <TableRow key={q.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{q.reference ?? `DEV-${q.id}`}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{q.created_at ?? '---'}</TableCell>
                  <TableCell>{q.total_ht != null ? `${q.total_ht.toLocaleString('fr-FR')} EUR` : '---'}</TableCell>
                  <TableCell>{q.total_ttc != null ? `${q.total_ttc.toLocaleString('fr-FR')} EUR` : '---'}</TableCell>
                  <TableCell>{q.subvention_type?.name ?? '---'}</TableCell>
                  <TableCell>
                    <Chip
                      label={q.status ?? 'ACTIVE'}
                      size='small'
                      color={q.status === 'ACTIVE' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {q.creator ? `${q.creator.firstname} ${q.creator.lastname}` : '---'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
