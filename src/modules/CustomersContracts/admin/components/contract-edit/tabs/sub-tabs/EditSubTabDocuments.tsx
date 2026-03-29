'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'

import type { CustomerContract } from '../../../../../types'
import type { ContractTranslations } from '../../../../hooks/useContractTranslations'
import { usePermissions } from '@/shared/contexts/PermissionsContext'

import { POLLUTER_TYPE_SUFFIXES, resolvePolluterType, formatDate } from './documents/helpers'
import { useDocumentState } from './documents/useDocumentState'
import DocumentLinkRow from './documents/DocumentLinkRow'
import QuotationDetailsTable from './documents/QuotationDetailsTable'
import BillingDetailsTable from './documents/BillingDetailsTable'
import CompanyModelsSection from './documents/CompanyModelsSection'
import CompanyDocSignatureSection from './documents/CompanyDocSignatureSection'
import CreateBillingDialog from './documents/CreateBillingDialog'
import EditQuotationView from './documents/EditQuotationView'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditSubTabDocumentsProps {
  contract: CustomerContract | null
  contractId: number | null
  t: ContractTranslations
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditSubTabDocuments({
  contract,
  contractId,
  t,
}: EditSubTabDocumentsProps) {
  const { hasCredential } = usePermissions()

  const hasPolluter = Boolean(contract?.polluter_id)
  const polluterCommercial = contract?.polluter?.commercial ?? contract?.polluter?.name ?? '-'
  const polluterType = contract?.polluter?.type?.toUpperCase() ?? resolvePolluterType(polluterCommercial)
  const suffix = POLLUTER_TYPE_SUFFIXES[polluterType] ?? ''
  const sectionTitle = `${t.docDocumentsFor} ${polluterCommercial}${suffix ? ` ${suffix}` : ''}`

  const isHold = contract?.is_hold === 'YES'

  // Date validity check (Symfony: opened_at <= billing_at)
  const hasValidDates = contract?.opened_at && contract?.billing_at
    ? contract.opened_at <= contract.billing_at
    : true

  // Permissions for top-level actions (exact Symfony credential names)
  const canEdit = hasCredential([['superadmin', 'app_domoprime_contract_view_quotation_edit', 'app_domoprime_contract_view_quotation_edit3']])
  const canCreateBilling = hasCredential([['superadmin', 'app_domoprime_list_quotation_create_billing']])
  const canUpdateLastBilling = hasCredential([['superadmin', 'app_domoprime_list_quotation_update_billing_from_last_quotation']])
  const canRefreshRef = hasCredential([['superadmin', 'app_domoprime_iso3_contract_list_quotation_refresh_reference']])

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

  // Build quotation / billing labels matching Symfony format
  const quotationLabel = lastQuotation
    ? `${t.docQuotations} ${lastQuotation.reference} ${formatDate(lastQuotation.dated_at)}`
    : t.docQuotations

  const billingLabel = lastBilling
    ? `${t.docBillings} ${lastBilling.reference} ${formatDate(lastBilling.dated_at)}`
    : t.docBillings

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

  // Inline edit view — replaces document list (same as Symfony AJAX replace)
  if (editingQuotationId) {
    return (
      <Box>
        <EditQuotationView
          quotationId={editingQuotationId}
          onSave={handleSaveQuotation}
          onCancel={cancelEditing}
          t={t}
        />

        {/* Notification Snackbar */}
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
    <Box>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <i className='ri-file-text-line' style={{ fontSize: 20 }} />
        <Typography variant='h6'>{sectionTitle}</Typography>
      </Box>

      {/* Date Warning */}
      {!hasValidDates ? (
        <Alert severity='warning' sx={{ mb: 2 }} icon={<i className='ri-error-warning-line' />}>
          {t.docVerifyBillingDate}
        </Alert>
      ) : null}

      {lastQuotation ? (
        <>
          {/* Symfony order 1: PreMeetingPolluterDocumentForViewContract — Document de pré visite */}
          <DocumentLinkRow
            icon='ri-file-user-line'
            label={t.docPreMeeting}
            available={hasPolluter && !isHold}
            loading={downloading === `premeeting-${contractId}`}
            onClick={() => handleDownloadPreMeetingPdf()}
          />

          {/* 2. Quotation top-level action bar (matches Symfony layout)    */}
          {/* PDF link + Edit + CreateBilling + UpdateLastBilling + Refresh  */}
          {/* + Details toggle + Yousign + Email                            */}
          {/* ============================================================= */}
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
            {/* PDF export for last quotation */}
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

            {/* Edit last quotation (blue pencil) */}
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

            {/* Create Billing from last quotation (euro icon) */}
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

            {/* Update Last Billing (blue euro icon) */}
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

            {/* Refresh Reference */}
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

            {/* Details toggle (loupe) */}
            <Tooltip title={expandedQuotation ? t.docHideDetails : t.docShowDetails}>
              <IconButton
                size='small'
                onClick={() => setExpandedQuotation(prev => !prev)}
              >
                <i className='ri-search-line' style={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            {/* Yousign — show status for last quotation */}
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

            {/* Email — send quotation email */}
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

          {/* Quotation Details Table (toggled by loupe icon above) */}
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

          {/* Symfony order 9: billingsITEForViewContract — Facture FAC-XXX dd/mm/yyyy */}
          {hasValidDates ? (
            <DocumentLinkRow
              icon='ri-bill-line'
              label={billingLabel}
              available={activeBillings.length > 0}
              loading={downloading === `all-${lastQuotation.id}`}
              onClick={() => activeBillings.length > 0 ? handleDownloadBillingPdf(lastBilling.id, lastBilling.reference) : undefined}
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

          {/* Symfony order 10: AfterWorkPolluterDocumentForViewContract — Document fin de travaux */}
          <DocumentLinkRow
            icon='ri-file-check-line'
            label={t.docAfterWork}
            available={hasPolluter && !isHold}
            loading={downloading === `afterwork-${contractId}`}
            onClick={() => handleDownloadAfterWorkPdf()}
          />

          {/* Symfony order 11: linkForAllDocumentsForContract */}
          <DocumentLinkRow
            icon='ri-folder-zip-line'
            label={t.docAllDocsComposite}
            available
            loading={downloading === `alldocs-${contractId}`}
            onClick={() => handleDownloadAllDocsPdf()}
          />

          {/* Symfony order 12: linkForAllSignedDocumentsForContract */}
          <DocumentLinkRow
            icon='ri-folder-shield-2-line'
            label={t.docAllSignedDocsComposite}
            available={lastQuotation.is_signed === 'YES'}
            loading={downloading === `allsigned-${contractId}`}
            onClick={() => handleDownloadAllSignedPdf()}
          />

          {/* Symfony order 13: site_company_document/documentIteForViewContract — La liste des modéles société */}
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

          {/* Symfony order 14: app_domoprime_yousign_evidence/linkCompanyDocumentForViewContract — socity document */}
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
        </>
      ) : (
        <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
          {t.docNoQuotations}
        </Typography>
      )}

      {/* Create Billing Dialog */}
      <CreateBillingDialog
        open={billingDialogOpen}
        onClose={closeBillingDialog}
        onConfirm={handleCreateBilling}
        loading={billingLoading}
        t={t}
      />

      {/* Notification Snackbar */}
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
