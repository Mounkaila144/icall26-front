'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'

import type { CustomerContract } from '../../../../../../../types'
import type { ContractTranslations } from '../../../../../../hooks/useContractTranslations'
import { usePermissions } from '@/shared/contexts/PermissionsContext'

import { POLLUTER_TYPE_SUFFIXES, formatDate } from '../helpers'
import { useDocumentState } from '../useDocumentState'
import DocumentLinkRow from '../DocumentLinkRow'
import QuotationDetailsTable from '../QuotationDetailsTable'
import BillingDetailsTable from '../BillingDetailsTable'
import CompanyModelsSection from '../CompanyModelsSection'
import CompanyDocSignatureSection from '../CompanyDocSignatureSection'
import CreateBillingDialog from '../CreateBillingDialog'
import EditQuotationView from '../EditQuotationView'

export type PolluterType = 'ITE' | 'BOILER' | 'PAC' | 'TYPE1' | 'TYPE2' | 'ISO'

export interface BasePolluterDocumentsSectionProps {
  contract: CustomerContract | null
  contractId: number | null
  t: ContractTranslations
  polluterType: PolluterType
}

export default function BasePolluterDocumentsSection({
  contract,
  contractId,
  t,
  polluterType,
}: BasePolluterDocumentsSectionProps) {
  const { hasCredential } = usePermissions()

  const polluterCommercial = contract?.polluter?.commercial ?? contract?.polluter?.name ?? '-'
  const suffix = POLLUTER_TYPE_SUFFIXES[polluterType] ?? ''
  const sectionTitle = `${t.docDocumentsFor} ${polluterCommercial}${suffix ? ` ${suffix}` : ''}`

  const isHold = contract?.is_hold === 'YES'

  const hasValidDates = contract?.opened_at && contract?.billing_at
    ? contract.opened_at <= contract.billing_at
    : true

  const canEdit = hasCredential([['superadmin', 'app_domoprime_contract_view_quotation_edit', 'app_domoprime_contract_view_quotation_edit3']])
  const canCreateBilling = hasCredential([['superadmin', 'app_domoprime_list_quotation_create_billing']])
  const canUpdateLastBilling = hasCredential([['superadmin', 'app_domoprime_list_quotation_update_billing_from_last_quotation']])
  const canRefreshRef = hasCredential([['superadmin', 'app_domoprime_iso3_contract_list_quotation_refresh_reference']])

  const canViewPreMeeting = hasCredential([['superadmin', 'app_domoprime_contract_view_premeeting_document']])
  const canViewAfterWork = hasCredential([['superadmin', 'app_domoprime_contract_view_afterwork_document']])
  const canViewAllDocs = hasCredential([['superadmin', 'app_domoprime_iso3_contract_view_all_documents']])
  const canViewAllSigned = hasCredential([['superadmin', 'app_domoprime_iso3_contract_view_all_signed_documents']])
  const canViewBillings = hasCredential([['superadmin', 'app_domoprime_contract_view_billings']])
  const canViewQuotations = hasCredential([['superadmin', 'app_domoprime_iso_contract_view_quotations']])

  const {
    loading,
    error,
    downloading,
    quotations,
    lastQuotation,
    activeBillings,
    lastBilling,
    expandedQuotation,
    setExpandedQuotation,
    expandedBilling,
    setExpandedBilling,
    expandedCompanyModels,
    setExpandedCompanyModels,
    expandedCompanyDocs,
    setExpandedCompanyDocs,
    handleDownloadPdf,
    handleDownloadSignedPdf,
    handleDisableQuotation,
    handleEnableQuotation,
    fetchDocuments,
    handleDownloadBillingPdf,
    handleSendBillingEmail,
    handleCreateAssetFromBilling,
    handleUpdateLastBilling,
    handleDownloadPreMeetingPdf,
    handleDownloadAfterWorkPdf,
    handleDownloadAllDocsPdf,
    handleDownloadAllSignedPdf,
    handleRefreshReference,
    handleSendQuotationEmail,
    billingDialogOpen,
    billingLoading,
    openBillingDialog,
    closeBillingDialog,
    handleCreateBilling,
    editingQuotationId,
    startEditing,
    cancelEditing,
    handleSaveQuotation,
    notification,
    handleCloseNotification,
  } = useDocumentState(contractId, t)

  const quotationLabel = lastQuotation
    ? `${t.docQuotations} ${lastQuotation.reference} ${formatDate(lastQuotation.dated_at)}`
    : t.docQuotations

  const billingLabel = lastBilling
    ? `${t.docBillings} ${lastBilling.reference} ${formatDate(lastBilling.dated_at)}`
    : t.docBillings

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

  if (editingQuotationId) {
    return (
      <Box>
        <EditQuotationView
          quotationId={editingQuotationId}
          onSave={handleSaveQuotation}
          onCancel={cancelEditing}
          t={t}
        />

        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant='filled'
            elevation={6}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    )
  }

  return (
    <Box data-polluter-type={polluterType}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <i className='ri-file-text-line' style={{ fontSize: 20 }} />
        <Typography variant='h6'>{sectionTitle}</Typography>
      </Box>

      {!hasValidDates ? (
        <Alert severity='warning' sx={{ mb: 2 }} icon={<i className='ri-error-warning-line' />}>
          {t.docVerifyBillingDate}
        </Alert>
      ) : null}

      {canViewPreMeeting ? (
        <DocumentLinkRow
          icon='ri-file-user-line'
          label={t.docPreMeeting}
          available={Boolean(contract?.polluter_id) && !isHold}
          loading={downloading === `premeeting-${contractId}`}
          onClick={() => handleDownloadPreMeetingPdf()}
        />
      ) : null}

      {canViewQuotations ? (
        lastQuotation ? (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.5,
                py: 1,
                px: 1,
                borderRadius: 1,
              }}
            >
              <Tooltip title={t.docDownloadPdf}>
                <IconButton
                  size='small'
                  color='primary'
                  disabled={downloading === `pdf-${lastQuotation.id}`}
                  onClick={() => handleDownloadPdf(lastQuotation.id, lastQuotation.reference)}
                >
                  {downloading === `pdf-${lastQuotation.id}`
                    ? <CircularProgress size={14} />
                    : <i className='ri-file-pdf-2-line' style={{ fontSize: 16 }} />
                  }
                </IconButton>
              </Tooltip>

              <Typography variant='body2' sx={{ mr: 1 }}>
                {quotationLabel}
              </Typography>

              {canEdit ? (
                <Tooltip title={t.docActionEdit}>
                  <span>
                    <IconButton
                      size='small'
                      sx={{ color: 'info.main' }}
                      disabled={isHold}
                      onClick={() => startEditing(lastQuotation.id)}
                    >
                      <i className='ri-pencil-line' style={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}

              {canCreateBilling ? (
                <Tooltip title={t.docActionBilling}>
                  <span>
                    <IconButton
                      size='small'
                      color='warning'
                      disabled={isHold}
                      onClick={() => openBillingDialog(lastQuotation.id)}
                    >
                      <i className='ri-money-euro-circle-line' style={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}

              {canUpdateLastBilling ? (
                <Tooltip title={t.docActionUpdateLastBilling}>
                  <span>
                    <IconButton
                      size='small'
                      sx={{ color: 'info.main' }}
                      disabled={isHold || activeBillings.length === 0}
                      onClick={() => handleUpdateLastBilling(lastQuotation.id)}
                    >
                      <i className='ri-money-euro-circle-line' style={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}

              {canRefreshRef ? (
                <Tooltip title={t.docRefresh}>
                  <IconButton
                    size='small'
                    onClick={() => handleRefreshReference(lastQuotation.id)}
                  >
                    <i className='ri-refresh-line' style={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={t.docRefresh}>
                  <IconButton
                    size='small'
                    onClick={() => fetchDocuments()}
                  >
                    <i className='ri-refresh-line' style={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title={expandedQuotation ? t.docHideDetails : t.docShowDetails}>
                <IconButton
                  size='small'
                  onClick={() => setExpandedQuotation(prev => !prev)}
                >
                  <i className='ri-search-line' style={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {lastQuotation.is_signed === 'YES' ? (
                <Tooltip title={`${t.docSigned} ${lastQuotation.signed_at ? formatDate(lastQuotation.signed_at) : ''}`}>
                  <IconButton
                    size='small'
                    color='success'
                    onClick={() => handleDownloadSignedPdf(lastQuotation.id, lastQuotation.reference)}
                  >
                    <i className='ri-check-double-line' style={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={t.docActionYousign}>
                  <span>
                    <IconButton size='small' color='success' disabled>
                      <i className='ri-quill-pen-line' style={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}

              <Tooltip title={t.docActionEmail}>
                <IconButton
                  size='small'
                  sx={{ color: 'info.main' }}
                  onClick={() => handleSendQuotationEmail(lastQuotation.id)}
                >
                  <i className='ri-mail-line' style={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Collapse in={expandedQuotation}>
              <Box sx={{ pl: 2, pb: 1 }}>
                <QuotationDetailsTable
                  quotations={quotations}
                  downloading={downloading}
                  isHold={isHold}
                  onDownloadPdf={handleDownloadPdf}
                  onDisable={handleDisableQuotation}
                  onEnable={handleEnableQuotation}
                  onOpenBillingDialog={openBillingDialog}
                  onEditQuotation={startEditing}
                  t={t}
                />
              </Box>
            </Collapse>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.5,
              py: 1,
              px: 1,
            }}
          >
            <Typography variant='body2' color='text.secondary' sx={{ mr: 1 }}>
              {t.docNoQuotations}
            </Typography>

            {/* Symfony quotationsITEForViewContract.tpl (theme32a actual): when no quotation,
                renders 2 "+" buttons + Docusign/Yousign/Yousign Evidence iframe + Email. */}
            {hasCredential([['superadmin', 'app_domoprime_iso3_contract_list_quotation_new']]) ? (
              <Tooltip title={t.docActionNewQuotation}>
                <span>
                  <IconButton size='small' color='primary' disabled={isHold}>
                    <i className='ri-add-line' style={{ fontSize: 16 }} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}

            {hasCredential([['superadmin', 'app_domoprime_iso3_contract_list_quotation_new3']]) ? (
              <Tooltip title={t.docActionNewQuotation3}>
                <span>
                  <IconButton size='small' sx={{ color: 'info.main' }} disabled={isHold}>
                    <i className='ri-add-line' style={{ fontSize: 16 }} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}

            <Tooltip title={t.docActionDocusign}>
              <span>
                <IconButton size='small' disabled>
                  <i className='ri-file-text-line' style={{ fontSize: 16, color: '#888' }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t.docActionYousign}>
              <span>
                <IconButton size='small' disabled>
                  <i className='ri-file-text-line' style={{ fontSize: 16, color: '#e53935' }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t.docActionYousignEvidence}>
              <span>
                <IconButton size='small' disabled>
                  <i className='ri-file-text-line' style={{ fontSize: 16, color: '#1976d2' }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t.docActionEmail}>
              <span>
                <IconButton size='small' sx={{ color: 'info.main' }} disabled>
                  <i className='ri-mail-line' style={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t.docRefresh}>
              <IconButton size='small' onClick={() => fetchDocuments()}>
                <i className='ri-refresh-line' style={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )
      ) : null}

      {hasValidDates && canViewBillings ? (
        <DocumentLinkRow
          icon='ri-bill-line'
          label={billingLabel}
          available={activeBillings.length > 0}
          loading={downloading === `all-${lastBilling?.id ?? 0}`}
          onClick={() => activeBillings.length > 0 && lastBilling
            ? handleDownloadBillingPdf(lastBilling.id, lastBilling.reference)
            : undefined}
          expandable={activeBillings.length > 1}
          expanded={expandedBilling}
          onToggle={() => setExpandedBilling(prev => !prev)}
        >
          <BillingDetailsTable
            billings={activeBillings}
            downloading={downloading}
            onDownloadPdf={handleDownloadBillingPdf}
            onSendEmail={handleSendBillingEmail}
            onCreateAsset={handleCreateAssetFromBilling}
            t={t}
          />
        </DocumentLinkRow>
      ) : null}

      {canViewAfterWork ? (
        <DocumentLinkRow
          icon='ri-file-check-line'
          label={t.docAfterWork}
          available={Boolean(contract?.polluter_id) && !isHold}
          loading={downloading === `afterwork-${contractId}`}
          onClick={() => handleDownloadAfterWorkPdf()}
        />
      ) : null}

      {canViewAllDocs ? (
        <DocumentLinkRow
          icon='ri-folder-zip-line'
          label={t.docAllDocsComposite}
          available
          loading={downloading === `alldocs-${contractId}`}
          onClick={() => handleDownloadAllDocsPdf()}
        />
      ) : null}

      {canViewAllSigned ? (
        <DocumentLinkRow
          icon='ri-folder-shield-2-line'
          label={t.docAllSignedDocsComposite}
          available={lastQuotation?.is_signed === 'YES'}
          loading={downloading === `allsigned-${contractId}`}
          onClick={() => handleDownloadAllSignedPdf()}
        />
      ) : null}

      {contractId ? (
        <DocumentLinkRow
          icon='ri-building-line'
          label={t.docCompanyModels}
          available
          expandable
          expanded={expandedCompanyModels}
          onToggle={() => setExpandedCompanyModels(prev => !prev)}
        >
          <CompanyModelsSection contractId={contractId} t={t} />
        </DocumentLinkRow>
      ) : null}

      {contractId ? (
        <DocumentLinkRow
          icon='ri-shield-check-line'
          label={t.docCompanyDocSignatures}
          available
          expandable
          expanded={expandedCompanyDocs}
          onToggle={() => setExpandedCompanyDocs(prev => !prev)}
        >
          <CompanyDocSignatureSection contractId={contractId} t={t} />
        </DocumentLinkRow>
      ) : null}

      <CreateBillingDialog
        open={billingDialogOpen}
        onClose={closeBillingDialog}
        onConfirm={handleCreateBilling}
        loading={billingLoading}
        t={t}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant='filled'
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
