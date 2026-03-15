'use client'

import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import { iso3CompanyDocsService } from '@/modules/AppDomoprimeISO3'
import type { CompanyModel } from '@/modules/AppDomoprimeISO3'
import type { ContractTranslations } from '../../../../../hooks/useContractTranslations'

interface CompanyModelsSectionProps {
  contractId: number
  t: ContractTranslations
}

export default function CompanyModelsSection({ contractId, t }: CompanyModelsSectionProps) {
  const [models, setModels] = useState<CompanyModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      try {
        const res = await iso3CompanyDocsService.listCompanyModels(contractId)

        if (!cancelled) setModels(res.data.models)
      } catch {
        if (!cancelled) setError(t.docLoadError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()

    return () => { cancelled = true }
  }, [contractId, t.docLoadError])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography variant='body2' color='error'>
        {error}
      </Typography>
    )
  }

  if (models.length === 0) {
    return (
      <Typography variant='body2' color='text.secondary'>
        -
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {models.map(model => (
        <Box
          key={model.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.5,
            px: 1,
            borderRadius: 1,
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <i className='ri-file-pdf-2-line' style={{ fontSize: 16, color: '#e53935' }} />
          <Typography variant='body2' sx={{ flex: 1 }}>
            {model.value || model.name}
          </Typography>
          {model.fileUrl ? (
            <Tooltip title={t.docDownloadPdf}>
              <IconButton
                size='small'
                color='primary'
                component='a'
                href={model.fileUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                <i className='ri-download-line' style={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>
      ))}
    </Box>
  )
}
