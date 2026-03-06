'use client'

import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Collapse from '@mui/material/Collapse'
import Button from '@mui/material/Button'

import { iso3QuotationService, iso3ExportService } from '@/modules/AppDomoprimeISO3'
import type { DomoprimeQuotation, DomoprimeBilling } from '@/modules/AppDomoprime/types'
import type { CustomerContract } from '../../../../../types'
import type { ContractTranslations } from '../../../../../hooks/useContractTranslations'

// ---------------------------------------------------------------------------
// Polluter type labels matching Symfony document sections
// ---------------------------------------------------------------------------

const POLLUTER_TYPE_LABELS: Record<string, string> = {
  ISO: 'Documents 101/102/103',
  BOILER: 'Documents Chaudiere',
  PAC: 'Documents PAC',
  ITE: 'Documents ITE',
  TYPE1: 'Documents Type 1',
  TYPE2: 'Documents Type 2',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditSubTabDocumentsProps {
  contract: CustomerContract | null
  contractId: number | null
  t: ContractTranslations
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-'

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

function resolvePolluterType(name: string): string {
  const upper = name.toUpperCase()

  if (upper.includes('BOILER') || upper.includes('CHAUDIERE')) return 'BOILER'
  if (upper.includes('PAC')) return 'PAC'
  if (upper.includes('ITE')) return 'ITE'
  if (upper.includes('TYPE1')) return 'TYPE1'
  if (upper.includes('TYPE2')) return 'TYPE2'

  return 'ISO'
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditSubTabDocuments({
  contract,
  contractId,
  t,
}: EditSubTabDocumentsProps) {
  const [quotations, setQuotations] = useState<DomoprimeQuotation[]>([])
  const [billings, setBillings] = useState<DomoprimeBilling[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllQuotations, setShowAllQuotations] = useState(false)
  const [showAllBillings, setShowAllBillings] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  const hasPolluter = Boolean(contract?.polluter_id)
  const polluterName = contract?.polluter?.name ?? '-'
  const polluterType = resolvePolluterType(polluterName)
  const sectionTitle = POLLUTER_TYPE_LABELS[polluterType] ?? `Documents - ${polluterName}`

  // Fetch quotations and billings
  const fetchDocuments = useCallback(async () => {
    if (!contractId) return

    setLoading(true)
    setError(null)

    try {
      const [quotRes, billRes] = await Promise.all([
        iso3QuotationService.listForContract(contractId),
        iso3QuotationService.listBillingsForContract(contractId),
      ])

      setQuotations(quotRes.data.quotations)
      setBillings(billRes.data.billings)
    } catch {
      setError(t.docLoadError)
    } finally {
      setLoading(false)
    }
  }, [contractId, t.docLoadError])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Separate active / deleted quotations
  const activeQuotations = quotations.filter(q => q.status === 'ACTIVE')
  const lastQuotation = activeQuotations.find(q => q.is_last === 'YES') ?? activeQuotations[0]

  // Separate active billings
  const activeBillings = billings.filter(b => b.status === 'ACTIVE')
  const lastBilling = activeBillings.find(b => b.is_last === 'YES') ?? activeBillings[0]

  // Date validity check (Symfony: opened_at <= billing_at)
  const hasValidDates = contract?.opened_at && contract?.billing_at
    ? contract.opened_at <= contract.billing_at
    : true

  // ------ Download handlers ------

  const handleDownloadPdf = useCallback(async (quotationId: number, ref: string) => {
    const key = `pdf-${quotationId}`

    setDownloading(key)

    try {
      const blob = await iso3ExportService.exportPdf(quotationId)

      downloadBlob(blob, `devis_${ref || quotationId}.pdf`)
    } catch {
      setError(t.docDownloadError ?? 'Erreur lors du t\u00e9l\u00e9chargement')
    } finally {
      setDownloading(null)
    }
  }, [t.docDownloadError])

  const handleDownloadAllPdf = useCallback(async (quotationId: number, ref: string) => {
    const key = `all-${quotationId}`

    setDownloading(key)

    try {
      const blob = await iso3ExportService.exportAllPdf(quotationId)

      downloadBlob(blob, `documents_${ref || quotationId}.pdf`)
    } catch {
      setError(t.docDownloadError ?? 'Erreur lors du t\u00e9l\u00e9chargement')
    } finally {
      setDownloading(null)
    }
  }, [t.docDownloadError])

  const handleDownloadSignedPdf = useCallback(async (quotationId: number, ref: string) => {
    const key = `signed-${quotationId}`

    setDownloading(key)

    try {
      const blob = await iso3ExportService.exportSignedPdf(quotationId)

      downloadBlob(blob, `devis_signe_${ref || quotationId}.pdf`)
    } catch {
      setError(t.docDownloadError ?? 'Erreur lors du t\u00e9l\u00e9chargement')
    } finally {
      setDownloading(null)
    }
  }, [t.docDownloadError])

  // ------ Early returns ------

  if (!hasPolluter) {
    return (
      <Alert severity='info' sx={{ mt: 2 }}>
        {t.docNoPolluter}
      </Alert>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error' sx={{ mt: 2 }}>{error}</Alert>
  }

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <i className='ri-file-text-line' style={{ fontSize: 20 }} />
        <Typography variant='h6'>{sectionTitle}</Typography>
        <Chip label={polluterName} size='small' variant='outlined' />
      </Box>

      {/* Date Warning */}
      {!hasValidDates ? (
        <Alert severity='warning' sx={{ mb: 2 }} icon={<i className='ri-error-warning-line' />}>
          {t.docVerifyBillingDate}
        </Alert>
      ) : null}

      {/* === QUOTATIONS SECTION === */}
      <Card variant='outlined' sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-file-list-3-line' />
              <Typography variant='subtitle1' fontWeight={600}>
                {t.docQuotations}
              </Typography>
              <Chip label={activeQuotations.length} size='small' color='primary' />
            </Box>
            <Tooltip title={t.docRefresh}>
              <IconButton size='small' onClick={fetchDocuments}>
                <i className='ri-refresh-line' />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Last Quotation Summary + Download */}
          {lastQuotation ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: 'action.hover',
                mb: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant='body2' fontWeight={600}>
                {lastQuotation.reference}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {lastQuotation.dated_at ?? '-'}
              </Typography>
              <Chip
                label={lastQuotation.is_signed === 'YES' ? t.docSigned : t.docNotSigned}
                size='small'
                color={lastQuotation.is_signed === 'YES' ? 'success' : 'default'}
                variant='outlined'
              />
              <Typography variant='body2'>
                TTC: {formatCurrency(lastQuotation.total_sale_with_tax)}
              </Typography>
              <Typography variant='body2'>
                HT: {formatCurrency(lastQuotation.total_sale_without_tax)}
              </Typography>

              {/* Download button for last quotation */}
              <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                <Tooltip title={t.docDownloadPdf}>
                  <IconButton
                    size='small'
                    color='primary'
                    disabled={downloading === `pdf-${lastQuotation.id}`}
                    onClick={() => handleDownloadPdf(lastQuotation.id, lastQuotation.reference)}
                  >
                    {downloading === `pdf-${lastQuotation.id}`
                      ? <CircularProgress size={16} />
                      : <i className='ri-file-download-line' />
                    }
                  </IconButton>
                </Tooltip>
                {lastQuotation.is_signed === 'YES' ? (
                  <Tooltip title={t.docDownloadSigned}>
                    <IconButton
                      size='small'
                      color='success'
                      disabled={downloading === `signed-${lastQuotation.id}`}
                      onClick={() => handleDownloadSignedPdf(lastQuotation.id, lastQuotation.reference)}
                    >
                      {downloading === `signed-${lastQuotation.id}`
                        ? <CircularProgress size={16} />
                        : <i className='ri-file-shield-2-line' />
                      }
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Box>
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {t.docNoQuotations}
            </Typography>
          )}

          {/* Toggle Details */}
          {activeQuotations.length > 1 ? (
            <>
              <Box
                sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                onClick={() => setShowAllQuotations(prev => !prev)}
              >
                <i className={showAllQuotations ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
                <Typography variant='body2' color='primary'>
                  {showAllQuotations ? t.docHideDetails : t.docShowDetails} ({activeQuotations.length})
                </Typography>
              </Box>

              <Collapse in={showAllQuotations}>
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
                      {activeQuotations.map((q, idx) => (
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
                                  onClick={() => handleDownloadPdf(q.id, q.reference)}
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
                                    onClick={() => handleDownloadSignedPdf(q.id, q.reference)}
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
              </Collapse>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* === BILLINGS SECTION === */}
      <Card variant='outlined' sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <i className='ri-bill-line' />
            <Typography variant='subtitle1' fontWeight={600}>
              {t.docBillings}
            </Typography>
            <Chip label={activeBillings.length} size='small' color='secondary' />
          </Box>

          {/* Last Billing Summary */}
          {lastBilling ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: 'action.hover',
                mb: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant='body2' fontWeight={600}>
                {lastBilling.reference}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {lastBilling.dated_at ?? '-'}
              </Typography>
              <Typography variant='body2'>
                TTC: {formatCurrency(lastBilling.total_sale_with_tax)}
              </Typography>
              <Typography variant='body2'>
                HT: {formatCurrency(lastBilling.total_sale_without_tax)}
              </Typography>
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {t.docNoBillings}
            </Typography>
          )}

          {/* Toggle Details */}
          {activeBillings.length > 1 ? (
            <>
              <Box
                sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                onClick={() => setShowAllBillings(prev => !prev)}
              >
                <i className={showAllBillings ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
                <Typography variant='body2' color='primary'>
                  {showAllBillings ? t.docHideDetails : t.docShowDetails} ({activeBillings.length})
                </Typography>
              </Box>

              <Collapse in={showAllBillings}>
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
                      {activeBillings.map((b, idx) => (
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
              </Collapse>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* === DOCUMENT LINKS SECTION === */}
      <Card variant='outlined'>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <i className='ri-links-line' />
            <Typography variant='subtitle1' fontWeight={600}>
              {t.docDocumentLinks}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {lastQuotation ? (
            <>
              {/* Single quotation PDF */}
              <DocumentLinkRow
                icon='ri-file-user-line'
                label={t.docPreMeeting}
                available={hasPolluter && contract?.is_hold !== 'YES'}
                loading={downloading === `pdf-${lastQuotation.id}`}
                onClick={() => handleDownloadPdf(lastQuotation.id, lastQuotation.reference)}
              />

              {/* All documents PDF */}
              <DocumentLinkRow
                icon='ri-file-chart-line'
                label={t.docAhDocument}
                available={hasValidDates}
                warning={!hasValidDates ? t.docVerifyBillingDate : undefined}
                loading={downloading === `all-${lastQuotation.id}`}
                onClick={() => handleDownloadAllPdf(lastQuotation.id, lastQuotation.reference)}
              />

              {/* Billing document */}
              <DocumentLinkRow
                icon='ri-file-list-2-line'
                label={t.docBillingDocument}
                available={activeBillings.length > 0}
                loading={downloading === `all-${lastQuotation.id}`}
                onClick={() => handleDownloadAllPdf(lastQuotation.id, lastQuotation.reference)}
              />

              {/* After-work / signed document */}
              <DocumentLinkRow
                icon='ri-file-check-line'
                label={t.docAfterWork}
                available={hasPolluter && contract?.is_hold !== 'YES' && lastQuotation.is_signed === 'YES'}
                loading={downloading === `signed-${lastQuotation.id}`}
                onClick={() => handleDownloadSignedPdf(lastQuotation.id, lastQuotation.reference)}
              />

              <Divider sx={{ my: 2 }} />

              {/* Bulk download - all documents */}
              <DocumentLinkRow
                icon='ri-folder-zip-line'
                label={t.docAllDocuments}
                available
                loading={downloading === `all-${lastQuotation.id}`}
                onClick={() => handleDownloadAllPdf(lastQuotation.id, lastQuotation.reference)}
              />

              {/* Signed documents only */}
              <DocumentLinkRow
                icon='ri-folder-shield-2-line'
                label={t.docAllSignedDocuments}
                available={lastQuotation.is_signed === 'YES'}
                loading={downloading === `signed-${lastQuotation.id}`}
                onClick={() => handleDownloadSignedPdf(lastQuotation.id, lastQuotation.reference)}
              />
            </>
          ) : (
            <Typography variant='body2' color='text.secondary'>
              {t.docNoQuotations}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// DocumentLinkRow
// ---------------------------------------------------------------------------

function DocumentLinkRow({
  icon,
  label,
  available,
  warning,
  loading: isLoading,
  onClick,
}: {
  icon: string
  label: string
  available: boolean
  warning?: string
  loading?: boolean
  onClick?: () => void
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1,
        px: 1,
        borderRadius: 1,
        cursor: available && onClick ? 'pointer' : 'default',
        '&:hover': { backgroundColor: available && onClick ? 'action.hover' : 'transparent' },
      }}
      onClick={available && onClick ? onClick : undefined}
    >
      <i className={icon} style={{ fontSize: 18, opacity: available ? 1 : 0.4 }} />
      <Typography variant='body2' sx={{ flex: 1, opacity: available ? 1 : 0.5 }}>
        {label}
      </Typography>
      {warning ? (
        <Tooltip title={warning}>
          <i className='ri-error-warning-line' style={{ color: '#f44336', fontSize: 16 }} />
        </Tooltip>
      ) : null}
      {isLoading ? (
        <CircularProgress size={18} />
      ) : (
        <Chip
          label={available ? 'PDF' : '-'}
          size='small'
          variant='outlined'
          color={available ? 'primary' : 'default'}
          disabled={!available}
          sx={{ minWidth: 40 }}
        />
      )}
    </Box>
  )
}
