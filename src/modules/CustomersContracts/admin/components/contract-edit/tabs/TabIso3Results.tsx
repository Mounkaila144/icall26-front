'use client'

import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'

import { iso3ResultsService } from '@/modules/AppDomoprimeISO3'
import type { Iso3ContractResultsData } from '@/modules/AppDomoprimeISO3'
import type { ContractTranslations } from '../../../hooks/useContractTranslations'

interface TabIso3ResultsProps {
  contractId: number | null
  lang: string
  t: ContractTranslations
}

export default function TabIso3Results({ contractId, lang, t }: TabIso3ResultsProps) {
  const [results, setResults] = useState<Iso3ContractResultsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!contractId) return

    let cancelled = false

    const fetchResults = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await iso3ResultsService.getResultsForContract(contractId, lang)

        if (!cancelled) {
          setResults(response.data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(t.iso3ResultsError)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchResults()

    return () => {
      cancelled = true
    }
  }, [contractId, lang, t.iso3ResultsError])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>
  }

  if (!results) return null

  if (!results.has_polluter) {
    return (
      <Alert severity='info' sx={{ mb: 2 }}>
        {t.iso3NoPolluter}
      </Alert>
    )
  }

  const { info, cumac } = results

  if (!info && !cumac) {
    return (
      <Alert severity='info' sx={{ mb: 2 }}>
        {t.iso3NoResults}
      </Alert>
    )
  }

  return (
    <Card variant='outlined' sx={{ mb: 3 }}>
      <CardContent>
        {/* Information Table */}
        {info ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <i className='ri-bar-chart-box-line' />
              <Typography variant='subtitle1' fontWeight={600}>
                {t.iso3InfoTitle}
              </Typography>
            </Box>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t.iso3Zone}</TableCell>
                    <TableCell>{t.iso3Region}</TableCell>
                    <TableCell>{t.iso3Energy}</TableCell>
                    <TableCell>{t.iso3Level}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{info.zone ?? '---'}</TableCell>
                    <TableCell>{info.region ?? '---'}</TableCell>
                    <TableCell>{info.energy ?? '---'}</TableCell>
                    <TableCell>{info.level ?? '----'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : null}

        {/* CUMAC Table */}
        {cumac ? (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <i className='ri-calculator-line' />
              <Typography variant='subtitle1' fontWeight={600}>
                CUMAC
              </Typography>
            </Box>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Qmac</TableCell>
                    <TableCell>Anah</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cumac.prices.map((price, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={index < cumac.prices.length - 1 ? { borderBottom: 'none' } : undefined}
                      >
                        {price.has_surface ? price.qmac : '---'}
                      </TableCell>
                      {index === 0 ? (
                        <TableCell rowSpan={cumac.prices.length}>
                          <Chip
                            label={cumac.is_ana_available ? t.iso3AnahAvailable : t.iso3AnahNotAvailable}
                            color={cumac.is_ana_available ? 'success' : 'default'}
                            size='small'
                            variant='outlined'
                          />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
