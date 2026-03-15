'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'

import type { CustomerContract } from '../../../../../types'
import type { ContractTranslations } from '../../../../../hooks/useContractTranslations'

import { POLLUTER_TYPE_SUFFIXES, resolvePolluterType, formatDate } from './documents/helpers'
import { useDocumentState } from './documents/useDocumentState'
import DocumentLinkRow from './documents/DocumentLinkRow'
import QuotationDetailsTable from './documents/QuotationDetailsTable'
import BillingDetailsTable from './documents/BillingDetailsTable'
import CompanyModelsSection from './documents/CompanyModelsSection'
import CompanyDocSignatureSection from './documents/CompanyDocSignatureSection'

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
  const hasPolluter = Boolean(contract?.polluter_id)
  const polluterCommercial = contract?.polluter?.commercial ?? contract?.polluter?.name ?? '-'
  const polluterType = contract?.polluter?.type?.toUpperCase() ?? resolvePolluterType(polluterCommercial)
  const suffix = POLLUTER_TYPE_SUFFIXES[polluterType] ?? ''
  const sectionTitle = `${t.docDocumentsFor} ${polluterCommercial}${suffix ? ` ${suffix}` : ''}`

  // Date validity check (Symfony: opened_at <= billing_at)
  const hasValidDates = contract?.opened_at && contract?.billing_at
    ? contract.opened_at <= contract.billing_at
    : true

  const {
    loading,
    error,
    downloading,
    activeQuotations,
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
    handleDownloadAllPdf,
    handleDownloadSignedPdf,
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
          {/* 1. Document de pré visite */}
          <DocumentLinkRow
            icon='ri-file-user-line'
            label={t.docPreMeeting}
            available={hasPolluter && contract?.is_hold !== 'YES'}
            loading={downloading === `pdf-${lastQuotation.id}`}
            onClick={() => handleDownloadPdf(lastQuotation.id, lastQuotation.reference)}
          />

          {/* 2. AH Document */}
          <DocumentLinkRow
            icon='ri-file-chart-line'
            label={t.docAhDocument}
            available={hasValidDates}
            warning={!hasValidDates ? t.docVerifyBillingDate : undefined}
            loading={downloading === `all-${lastQuotation.id}`}
            onClick={() => handleDownloadAllPdf(lastQuotation.id, lastQuotation.reference)}
          />

          {/* 3. Devis DEV-XXX dd/mm/yyyy (expandable) */}
          <DocumentLinkRow
            icon='ri-file-list-3-line'
            label={quotationLabel}
            available={activeQuotations.length > 0}
            loading={downloading === `pdf-${lastQuotation.id}`}
            onClick={() => handleDownloadPdf(lastQuotation.id, lastQuotation.reference)}
            expandable={activeQuotations.length > 1}
            expanded={expandedQuotation}
            onToggle={() => setExpandedQuotation(prev => !prev)}
          >
            <QuotationDetailsTable
              quotations={activeQuotations}
              downloading={downloading}
              onDownloadPdf={handleDownloadPdf}
              onDownloadSignedPdf={handleDownloadSignedPdf}
              t={t}
            />
          </DocumentLinkRow>

          {/* 4. Facture FAC-XXX dd/mm/yyyy (expandable) */}
          <DocumentLinkRow
            icon='ri-bill-line'
            label={billingLabel}
            available={activeBillings.length > 0}
            loading={downloading === `all-${lastQuotation.id}`}
            onClick={() => handleDownloadAllPdf(lastQuotation.id, lastQuotation.reference)}
            expandable={activeBillings.length > 1}
            expanded={expandedBilling}
            onToggle={() => setExpandedBilling(prev => !prev)}
          >
            <BillingDetailsTable billings={activeBillings} t={t} />
          </DocumentLinkRow>

          {/* 5. Document fin de travaux */}
          <DocumentLinkRow
            icon='ri-file-check-line'
            label={t.docEndOfWork}
            available={hasPolluter && contract?.is_hold !== 'YES' && lastQuotation.is_signed === 'YES'}
            loading={downloading === `signed-${lastQuotation.id}`}
            onClick={() => handleDownloadSignedPdf(lastQuotation.id, lastQuotation.reference)}
          />

          <Divider sx={{ my: 1.5 }} />

          {/* 6. Document Prévisite/Vérif fiscal/AH/Devis/Facture */}
          <DocumentLinkRow
            icon='ri-folder-zip-line'
            label={t.docAllDocsComposite}
            available
            loading={downloading === `all-${lastQuotation.id}`}
            onClick={() => handleDownloadAllPdf(lastQuotation.id, lastQuotation.reference)}
          />

          {/* 7. Documents Pré visite/Verifs/AH signé/Devis signé/Facture */}
          <DocumentLinkRow
            icon='ri-folder-shield-2-line'
            label={t.docAllSignedDocsComposite}
            available={lastQuotation.is_signed === 'YES'}
            loading={downloading === `signed-${lastQuotation.id}`}
            onClick={() => handleDownloadSignedPdf(lastQuotation.id, lastQuotation.reference)}
          />
        </>
      ) : (
        <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
          {t.docNoQuotations}
        </Typography>
      )}

      <Divider sx={{ my: 1.5 }} />

      {/* 8. La liste des modèles société (expandable) */}
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

      {/* 9. Documents société avec statut signature (expandable) */}
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
    </Box>
  )
}
