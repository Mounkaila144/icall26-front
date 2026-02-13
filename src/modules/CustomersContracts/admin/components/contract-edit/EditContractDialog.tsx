'use client'

import { useEffect, useCallback } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import type { AxiosError } from 'axios'

import { useEditContractState } from './useEditContractState'
import { useFilterOptions } from '../../hooks/useFilterOptions'
import { useContractTranslations } from '../../hooks/useContractTranslations'
import TabContractDetails from './tabs/TabContractDetails'
import TabTeamAttribution from './tabs/TabTeamAttribution'
import TabFinanceStatus from './tabs/TabFinanceStatus'

import type { CustomerContract, UpdateContractData } from '../../../types'

interface ApiValidationError {
  message: string
  errors?: Record<string, string[]>
}

interface EditContractDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: number, data: UpdateContractData) => Promise<void>
  contractId: number | null
  onFetchContract: (id: number) => Promise<CustomerContract | null>
}

export default function EditContractDialog({
  isOpen,
  onClose,
  onUpdate,
  contractId,
  onFetchContract,
}: EditContractDialogProps) {
  const t = useContractTranslations()
  const { filterOptions, filterOptionsLoading } = useFilterOptions()

  const {
    activeTab,
    setActiveTab,
    contract,
    loading,
    submitting,
    setSubmitting,
    error,
    setError,
    detailsForm,
    teamFinanceForm,
    loadContract,
    getFormData,
    resetAll,
  } = useEditContractState()

  // Load contract when dialog opens
  useEffect(() => {
    if (isOpen && contractId) {
      loadContract(contractId, onFetchContract)
    }

    if (!isOpen) {
      resetAll()
    }
  }, [isOpen, contractId, loadContract, onFetchContract, resetAll])

  const handleSave = useCallback(async () => {
    if (!contractId) return

    setSubmitting(true)
    setError(null)

    try {
      const data = getFormData()

      await onUpdate(contractId, data)
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ApiValidationError>
      const responseData = axiosErr?.response?.data

      if (responseData?.errors) {
        const messages = Object.values(responseData.errors).flat()

        setError(messages.join('\n'))
      } else if (responseData?.message) {
        setError(responseData.message)
      } else {
        setError(err instanceof Error ? err.message : String(err))
      }
    } finally {
      setSubmitting(false)
    }
  }, [contractId, getFormData, onUpdate, onClose, setSubmitting, setError])

  const tabValue = String(activeTab)

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth='md' fullWidth scroll='paper'>
      {submitting ? <LinearProgress /> : null}

      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant='h5' component='span'>{t.editContract}</Typography>
          {contract?.reference ? (
            <Typography variant='body2' color='text.secondary'>
              {t.referenceLabel}: {contract.reference}
            </Typography>
          ) : null}
        </Box>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Alert severity='error' sx={{ mb: 3, whiteSpace: 'pre-line' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TabContext value={tabValue}>
            <TabList
              onChange={(_, val) => setActiveTab(Number(val))}
              variant='fullWidth'
              sx={{ mb: 3 }}
            >
              <Tab
                label={t.editTabDetails}
                value='0'
                icon={<i className='ri-file-list-line' />}
                iconPosition='start'
              />
              <Tab
                label={t.editTabTeam}
                value='1'
                icon={<i className='ri-team-line' />}
                iconPosition='start'
              />
              <Tab
                label={t.editTabFinance}
                value='2'
                icon={<i className='ri-money-euro-circle-line' />}
                iconPosition='start'
              />
            </TabList>

            <TabPanel value='0' sx={{ p: 0 }}>
              <TabContractDetails form={detailsForm} contract={contract} t={t} />
            </TabPanel>
            <TabPanel value='1' sx={{ p: 0 }}>
              <TabTeamAttribution
                form={teamFinanceForm}
                filterOptions={filterOptions}
                filterOptionsLoading={filterOptionsLoading}
                t={t}
              />
            </TabPanel>
            <TabPanel value='2' sx={{ p: 0 }}>
              <TabFinanceStatus
                form={teamFinanceForm}
                filterOptions={filterOptions}
                t={t}
              />
            </TabPanel>
          </TabContext>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color='secondary'>
          {t.cancel}
        </Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={submitting || loading}
        >
          {submitting ? t.editSaving : t.editSave}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
