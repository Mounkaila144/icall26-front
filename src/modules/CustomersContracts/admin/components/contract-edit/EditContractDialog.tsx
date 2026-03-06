'use client'

import { useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
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
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'

import type { AxiosError } from 'axios'

import { useEditContractState } from './useEditContractState'
import { useEditPermissions } from './useEditPermissions'
import { useFilterOptions } from '../../hooks/useFilterOptions'
import { useContractTranslations } from '../../hooks/useContractTranslations'
import { useDomoprimeFilterOptions } from '@/modules/AppDomoprime'
import { domoprimeIsoService } from '@/modules/AppDomoprime/admin/services/domoprimeService'
import TabContractDetails from './tabs/TabContractDetails'
import TabTeamAttribution from './tabs/TabTeamAttribution'
import TabFinanceStatus from './tabs/TabFinanceStatus'
import TabPlaceholder from './tabs/TabPlaceholder'

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

/** Tab definitions — order matches the user requirement */
const TAB_KEYS = [
  'contrat',
  'calculSubvention',
  'resultatsAnah',
  'requests',
  'factures',
  'avoirs',
  'informations',
  'attributions',
  'attributionsBracket',
  'planning',
  'installations',
  'demarches',
  'docCheck',
  'documents',
  'emails',
  'whatsApp',
  'partnerWhatsApp',
  'carte',
] as const

type TabKey = (typeof TAB_KEYS)[number]

interface TabDef {
  key: TabKey
  labelKey: keyof ReturnType<typeof useContractTranslations>
  icon: string
}

const TABS: TabDef[] = [
  { key: 'contrat', labelKey: 'editTabContrat', icon: 'ri-file-list-line' },
  { key: 'calculSubvention', labelKey: 'editTabCalculSubvention', icon: 'ri-calculator-line' },
  { key: 'resultatsAnah', labelKey: 'editTabResultatsAnah', icon: 'ri-bar-chart-box-line' },
  { key: 'requests', labelKey: 'editTabRequests', icon: 'ri-mail-send-line' },
  { key: 'factures', labelKey: 'editTabFactures', icon: 'ri-bill-line' },
  { key: 'avoirs', labelKey: 'editTabAvoirs', icon: 'ri-refund-2-line' },
  { key: 'informations', labelKey: 'editTabInformations', icon: 'ri-information-line' },
  { key: 'attributions', labelKey: 'editTabAttributions', icon: 'ri-team-line' },
  { key: 'attributionsBracket', labelKey: 'editTabAttributionsBracket', icon: 'ri-user-settings-line' },
  { key: 'planning', labelKey: 'editTabPlanning', icon: 'ri-calendar-schedule-line' },
  { key: 'installations', labelKey: 'editTabInstallations', icon: 'ri-tools-line' },
  { key: 'demarches', labelKey: 'editTabDemarches', icon: 'ri-file-paper-2-line' },
  { key: 'docCheck', labelKey: 'editTabDocCheck', icon: 'ri-file-check-line' },
  { key: 'documents', labelKey: 'editTabDocuments', icon: 'ri-folder-line' },
  { key: 'emails', labelKey: 'editTabEmails', icon: 'ri-mail-line' },
  { key: 'whatsApp', labelKey: 'editTabWhatsApp', icon: 'ri-whatsapp-line' },
  { key: 'partnerWhatsApp', labelKey: 'editTabPartnerWhatsApp', icon: 'ri-chat-3-line' },
  { key: 'carte', labelKey: 'editTabCarte', icon: 'ri-map-pin-line' },
]

export default function EditContractDialog({
  isOpen,
  onClose,
  onUpdate,
  contractId,
  onFetchContract,
}: EditContractDialogProps) {
  const t = useContractTranslations()
  const { lang } = useParams<{ lang: string }>()
  const { canEdit } = useEditPermissions()
  const { filterOptions, filterOptionsLoading } = useFilterOptions()
  const { filterOptions: domoprimeOptions, loading: domoprimeOptionsLoading } = useDomoprimeFilterOptions()

  const canViewIso3Results = canEdit('app_domoprime_iso3_contract_view_cumac_results')

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
    customerForm,
    isoForm,
    verifForm,
    loadContract,
    getFormData,
    resetAll,
  } = useEditContractState()

  // Load contract when dialog opens
  useEffect(() => {
    if (isOpen && contractId) {
      // Wrapper function to load ISO data
      const fetchIsoData = async (id: number) => {
        try {
          const response = await domoprimeIsoService.getByContractId(id)
          return response.success ? response.data : null
        } catch (error) {
          console.error('Failed to load ISO data:', error)
          return null
        }
      }

      loadContract(contractId, onFetchContract, fetchIsoData)
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

  const renderTabContent = (key: TabKey, index: number) => {
    const tab = TABS[index]

    switch (key) {
      case 'contrat':
        return (
          <TabContractDetails
            detailsForm={detailsForm}
            customerForm={customerForm}
            isoForm={isoForm}
            verifForm={verifForm}
            teamFinanceForm={teamFinanceForm}
            contract={contract}
            filterOptions={filterOptions}
            domoprimeOptions={domoprimeOptions}
            contractId={contractId}
            lang={lang || 'fr'}
            canViewIso3Results={canViewIso3Results}
            t={t}
          />
        )
      case 'attributions':
        return (
          <TabTeamAttribution
            form={teamFinanceForm}
            filterOptions={filterOptions}
            filterOptionsLoading={filterOptionsLoading}
            t={t}
          />
        )
      case 'informations':
        return <TabFinanceStatus form={teamFinanceForm} filterOptions={filterOptions} t={t} />
      default:
        return (
          <TabPlaceholder
            tabName={String(t[tab.labelKey])}
            icon={tab.icon}
            t={t}
          />
        )
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth='xl' fullWidth>
      {submitting ? <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1301 }} /> : null}

      <AppBar sx={{ position: 'sticky', top: 0, zIndex: 1 }} color='default' elevation={1}>
        <Toolbar>
          <IconButton edge='start' onClick={onClose} aria-label='close'>
            <i className='ri-close-line' />
          </IconButton>
          <Box sx={{ flex: 1, ml: 2 }}>
            <Typography variant='h6' component='span'>{t.editContract}</Typography>
            {contract?.reference ? (
              <Typography variant='body2' color='text.secondary'>
                {t.referenceLabel}: {contract.reference}
              </Typography>
            ) : null}
          </Box>
          <Button color='secondary' onClick={onClose} sx={{ mr: 1 }}>
            {t.cancel}
          </Button>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={submitting || loading}
          >
            {submitting ? t.editSaving : t.editSave}
          </Button>
        </Toolbar>
      </AppBar>

      <DialogContent sx={{ p: 0 }}>
        {error ? (
          <Alert severity='error' sx={{ m: 2, whiteSpace: 'pre-line' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
              <TabList
                onChange={(_, val) => setActiveTab(Number(val))}
                variant='scrollable'
                scrollButtons={true}
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTabs-scrollButtons': {
                    width: 40,
                    color: 'primary.main',
                    backgroundColor: 'background.paper',
                    boxShadow: 1,
                    borderRadius: 1,
                    my: 'auto',
                    '&.Mui-disabled': {
                      opacity: 0.3,
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  },
                  '& .MuiTabs-scrollButtons.MuiTabScrollButton-horizontal': {
                    height: 36,
                  },
                  '& .MuiTabs-scroller': {
                    overflowX: 'auto !important',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                      height: 6,
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'action.hover',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'primary.main',
                      borderRadius: 3,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                  },
                }}
              >
                {TABS.map((tab, index) => (
                  <Tab
                    key={tab.key}
                    label={String(t[tab.labelKey])}
                    value={String(index)}
                    icon={<i className={tab.icon} />}
                    iconPosition='start'
                    sx={{
                      minHeight: 48,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </TabList>
            </Box>

            {TABS.map((tab, index) => (
              <TabPanel key={tab.key} value={String(index)} sx={{ p: 3 }}>
                {renderTabContent(tab.key, index)}
              </TabPanel>
            ))}
          </TabContext>
        )}
      </DialogContent>
    </Dialog>
  )
}
