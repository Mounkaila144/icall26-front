import { useState, useEffect, useCallback } from 'react'

import { iso3QuotationService, iso3ExportService } from '@/modules/AppDomoprimeISO3'
import type { DomoprimeQuotation, DomoprimeBilling } from '@/modules/AppDomoprime/types'
import type { ContractTranslations } from '../../../../../hooks/useContractTranslations'

import { downloadBlob } from './helpers'

export function useDocumentState(contractId: number | null, t: ContractTranslations) {
  const [quotations, setQuotations] = useState<DomoprimeQuotation[]>([])
  const [billings, setBillings] = useState<DomoprimeBilling[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [expandedQuotation, setExpandedQuotation] = useState(false)
  const [expandedBilling, setExpandedBilling] = useState(false)
  const [expandedCompanyModels, setExpandedCompanyModels] = useState(false)
  const [expandedCompanyDocs, setExpandedCompanyDocs] = useState(false)

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

  // Derived data
  const activeQuotations = quotations.filter(q => q.status === 'ACTIVE')
  const lastQuotation = activeQuotations.find(q => q.is_last === 'YES') ?? activeQuotations[0]
  const activeBillings = billings.filter(b => b.status === 'ACTIVE')
  const lastBilling = activeBillings.find(b => b.is_last === 'YES') ?? activeBillings[0]

  // Download handlers
  const handleDownloadPdf = useCallback(async (quotationId: number, ref: string) => {
    const key = `pdf-${quotationId}`

    setDownloading(key)

    try {
      const blob = await iso3ExportService.exportPdf(quotationId)

      downloadBlob(blob, `devis_${ref || quotationId}.pdf`)
    } catch {
      setError(t.docDownloadError ?? 'Erreur lors du téléchargement')
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
      setError(t.docDownloadError ?? 'Erreur lors du téléchargement')
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
      setError(t.docDownloadError ?? 'Erreur lors du téléchargement')
    } finally {
      setDownloading(null)
    }
  }, [t.docDownloadError])

  return {
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
    fetchDocuments,
  }
}
