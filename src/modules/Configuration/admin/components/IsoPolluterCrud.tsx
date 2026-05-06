'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { apiClient } from '@/shared/lib/api-client'
import { useConfigTranslations } from '@/modules/Configuration/admin/hooks/useConfigTranslations'
import { usePermissions } from '@/shared/contexts/PermissionsContext'

import PolluterContactsCrud from './iso-polluter/PolluterContactsCrud'
import PolluterDocumentsCrud from './iso-polluter/PolluterDocumentsCrud'
import PolluterLayerForm from './iso-polluter/PolluterLayerForm'
import PolluterModelSelector from './iso-polluter/PolluterModelSelector'
import PolluterModelsCrud from './iso-polluter/PolluterModelsCrud'
import PolluterPricingCrud from './iso-polluter/PolluterPricingCrud'
import PolluterPricingVariantCrud from './iso-polluter/PolluterPricingVariantCrud'
import PolluterProductForm from './iso-polluter/PolluterProductForm'
import PolluterPropertyForm from './iso-polluter/PolluterPropertyForm'
import PolluterRecipientForm from './iso-polluter/PolluterRecipientForm'
import PolluterSubSectionStub from './iso-polluter/PolluterSubSectionStub'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PolluterItem {
  id: number
  name: string
  commercial: string | null
  postcode: string | null
  city: string | null
  phone: string | null
  mobile: string | null
  email: string | null
  is_active: string
  is_default: string
  type: string | null
  ape: string | null
  siret: string | null
  tva: string | null
  address1: string | null
  address2: string | null
  country: string | null
  web: string | null
  fax: string | null
}

interface FormData {
  name: string
  commercial: string
  type: string
  is_active: string
  is_default: string
  email: string
  web: string
  phone: string
  mobile: string
  fax: string
  address1: string
  address2: string
  postcode: string
  city: string
  country: string
  ape: string
  siret: string
  tva: string
}

interface FilterState {
  name: string
  commercial: string
  postcode: string
  city: string
  phone: string
  is_active: string
  order_by: string
  order_dir: 'asc' | 'desc'
}

type SubSectionKey =
  | 'contacts'
  | 'layer'
  | 'pricing'
  | 'products'
  | 'properties'
  | 'boilerPack'
  | 'itePrice'
  | 'models'
  | 'documentsModels'
  | 'preMeetingModel'
  | 'quotationModel'
  | 'documents'
  | 'billingModel'
  | 'afterWorkModel'
  | 'recipients'

const emptyForm: FormData = {
  name: '',
  commercial: '',
  type: '',
  is_active: 'YES',
  is_default: 'NO',
  email: '',
  web: '',
  phone: '',
  mobile: '',
  fax: '',
  address1: '',
  address2: '',
  postcode: '',
  city: '',
  country: '',
  ape: '',
  siret: '',
  tva: '',
}

const emptyFilter: FilterState = {
  name: '',
  commercial: '',
  postcode: '',
  city: '',
  phone: '',
  is_active: 'ALL',
  order_by: 'name',
  order_dir: 'asc',
}

const BASE = '/admin/appdomoprime/iso/polluters'

const isYes = (val: unknown): boolean => {
  if (typeof val === 'string') return val.toUpperCase() === 'YES'
  return Boolean(val)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IsoPolluterCrud() {
  const t = useConfigTranslations()
  const { hasCredential } = usePermissions()

  const [items, setItems] = useState<PolluterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [filter, setFilter] = useState<FilterState>(emptyFilter)

  // Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PolluterItem | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Delete (soft) dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<PolluterItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Remove (hard) dialog
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [removingItem, setRemovingItem] = useState<PolluterItem | null>(null)
  const [removing, setRemoving] = useState(false)

  // Import dialog
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  // Sub-section navigation
  const [subSection, setSubSection] = useState<{ key: SubSectionKey; polluter: PolluterItem } | null>(null)

  // ─── Permissions (granular per-action) ────────────────────────────────────
  // Mirrors theme32a:
  //   sites/themes/admin/theme32a/designs/default/templates/app_domoprime/app_domoprime_ajaxListPartialPollutingCompany.tpl

  const can = useMemo(
    () => ({
      view:           hasCredential([['superadmin', 'admin', 'app_domoprime_settings_view_polluter']]),
      contacts:       hasCredential([['superadmin', 'admin', 'app_domoprime_settings_contracts_polluter']]),
      layer:          hasCredential([['superadmin', 'admin', 'app_domoprime_settings_layer_list_polluter']]),
      pricing:        hasCredential([['superadmin', 'admin', 'app_domoprime_settings_pricing_list_polluter']]),
      properties:     hasCredential([['superadmin', 'admin', 'app_domoprime_settings_properties_list_polluter']]),
      boilerPack:     hasCredential([['superadmin', 'admin', 'app_domoprime_settings_boiler_pack_list_polluter']]),
      itePrice:       hasCredential([['superadmin', 'admin', 'app_domoprime_settings_ite_price_list_polluter']]),
      models:         hasCredential([['superadmin', 'admin', 'app_domoprime_settings_models_list_polluter']]),
      docModels:      hasCredential([['superadmin', 'admin', 'app_domoprime_settings_documents_models_list_polluter']]),
      preMeeting:     hasCredential([['superadmin', 'admin', 'app_domoprime_settings_premeeting_models_list_polluter']]),
      quotationModel: hasCredential([['superadmin', 'admin', 'app_domoprime_settings_quotation_models_list_polluter']]),
      documents:      hasCredential([['superadmin', 'admin', 'app_domoprime_settings_documents_list_polluter']]),
      billingModel:   hasCredential([['superadmin', 'admin', 'app_domoprime_settings_billing_models_list_polluter']]),
      afterWork:      hasCredential([['superadmin', 'admin', 'app_domoprime_settings_after_work_models_list_polluter']]),
      recipients:     hasCredential([['superadmin', 'admin', 'app_domoprime_settings_recipient_list_polluter']]),
      exportOne:      hasCredential([['superadmin', 'admin', 'app_domoprime_settings_export_polluter']]),
      delete:         hasCredential([['superadmin', 'admin', 'app_domoprime_settings_delete_polluter']]),
      remove:         hasCredential([['superadmin', 'admin', 'app_domoprime_settings_remove_polluter']]),
      superadmin:     hasCredential([['superadmin']]),
    }),
    [hasCredential],
  )

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: Record<string, string> = {
        order_by: filter.order_by,
        order_dir: filter.order_dir,
      }
      if (filter.is_active !== 'ALL') params.is_active = filter.is_active
      if (filter.name) params.name = filter.name
      if (filter.commercial) params.commercial = filter.commercial
      if (filter.postcode) params.postcode = filter.postcode
      if (filter.city) params.city = filter.city
      if (filter.phone) params.phone = filter.phone

      const res = await apiClient.get<{ success: boolean; data: PolluterItem[] }>(BASE, { params })
      if (res.data.success) setItems(res.data.data)
    } catch {
      setError(t.settingsLoadError)
    } finally {
      setLoading(false)
    }
  }, [filter, t.settingsLoadError])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // ─── Sort ─────────────────────────────────────────────────────────────────

  const handleSort = (col: string) => {
    setFilter(prev => ({
      ...prev,
      order_by: col,
      order_dir: prev.order_by === col && prev.order_dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  // ─── Field updater ────────────────────────────────────────────────────────

  const set = (key: keyof FormData, value: string) =>
    setFormData(prev => ({ ...prev, [key]: value }))

  // ─── Edit dialog ──────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: PolluterItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      commercial: item.commercial ?? '',
      type: item.type ?? '',
      is_active: item.is_active,
      is_default: item.is_default,
      email: item.email ?? '',
      web: item.web ?? '',
      phone: item.phone ?? '',
      mobile: item.mobile ?? '',
      fax: item.fax ?? '',
      address1: item.address1 ?? '',
      address2: item.address2 ?? '',
      postcode: item.postcode ?? '',
      city: item.city ?? '',
      country: item.country ?? '',
      ape: item.ape ?? '',
      siret: item.siret ?? '',
      tva: item.tva ?? '',
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setFormData(emptyForm)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (editingItem) {
        const res = await apiClient.put<{ success: boolean; data: PolluterItem }>(
          `${BASE}/${editingItem.id}`,
          formData,
        )
        if (res.data.success) {
          setItems(prev => prev.map(i => (i.id === editingItem.id ? res.data.data : i)))
          setSuccessMsg(t.settingsSaved)
          handleCloseDialog()
        }
      } else {
        const res = await apiClient.post<{ success: boolean; data: PolluterItem }>(BASE, formData)
        if (res.data.success) {
          setItems(prev => [...prev, res.data.data])
          setSuccessMsg(t.settingsSaved)
          handleCloseDialog()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.settingsSaveError)
    } finally {
      setSaving(false)
    }
  }

  // ─── Toggle is_active inline ──────────────────────────────────────────────

  const handleToggleActive = async (item: PolluterItem) => {
    try {
      const res = await apiClient.patch<{ success: boolean; data: PolluterItem }>(
        `${BASE}/${item.id}/toggle-active`,
      )
      if (res.data.success) {
        setItems(prev => prev.map(i => (i.id === item.id ? res.data.data : i)))
        setSuccessMsg(t.isoPolluterToggled)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.settingsSaveError)
    }
  }

  // ─── Delete (soft) ────────────────────────────────────────────────────────

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    setDeleting(true)
    setError(null)
    try {
      const res = await apiClient.delete<{ success: boolean }>(`${BASE}/${deletingItem.id}`)
      if (res.data.success) {
        setItems(prev => prev.filter(i => i.id !== deletingItem.id))
        setSuccessMsg(t.settingsSaved)
        setDeleteDialogOpen(false)
        setDeletingItem(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.settingsSaveError)
    } finally {
      setDeleting(false)
    }
  }

  // ─── Remove (hard) ────────────────────────────────────────────────────────

  const handleConfirmRemove = async () => {
    if (!removingItem) return
    setRemoving(true)
    setError(null)
    try {
      const res = await apiClient.delete<{ success: boolean }>(`${BASE}/${removingItem.id}/remove`)
      if (res.data.success) {
        setItems(prev => prev.filter(i => i.id !== removingItem.id))
        setSuccessMsg(t.settingsSaved)
        setRemoveDialogOpen(false)
        setRemovingItem(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.settingsSaveError)
    } finally {
      setRemoving(false)
    }
  }

  // ─── Import ───────────────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      const res = await apiClient.post<{ success: boolean; message: string }>(
        `${BASE}/import`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      if (res.data.success) {
        setSuccessMsg(res.data.message || t.isoPolluterImported)
        setImportDialogOpen(false)
        setImportFile(null)
        fetchItems()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.settingsSaveError)
    } finally {
      setImporting(false)
    }
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  const handleExportAll = () => {
    window.open(`/api${BASE}/export`, '_blank')
  }

  const handleExportOne = (id: number) => {
    window.open(`/api${BASE}/${id}/export`, '_blank')
  }

  // ─── Sub-section render ──────────────────────────────────────────────────

  if (subSection) {
    const subTitles: Record<SubSectionKey, string> = {
      contacts: t.isoPolluterRowAction_Contacts,
      layer: t.isoPolluterRowAction_Layer,
      pricing: t.isoPolluterRowAction_Pricing,
      products: t.isoPolluterRowAction_Products,
      properties: t.isoPolluterRowAction_Properties,
      boilerPack: t.isoPolluterRowAction_BoilerPack,
      itePrice: t.isoPolluterRowAction_ITEPrice,
      models: t.isoPolluterRowAction_Models,
      documentsModels: t.isoPolluterRowAction_DocumentsModels,
      preMeetingModel: t.isoPolluterRowAction_PreMeetingModel,
      quotationModel: t.isoPolluterRowAction_QuotationModel,
      documents: t.isoPolluterRowAction_Documents,
      billingModel: t.isoPolluterRowAction_BillingModel,
      afterWorkModel: t.isoPolluterRowAction_AfterWorkModel,
      recipients: t.isoPolluterRowAction_Recipients,
    }

    // ── Real sub-CRUDs (migrated from theme32a) ──
    if (subSection.key === 'contacts') {
      return (
        <PolluterContactsCrud
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'recipients') {
      return (
        <PolluterRecipientForm
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'layer') {
      return (
        <PolluterLayerForm
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'quotationModel') {
      return (
        <PolluterModelSelector
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          modelType='quotation'
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'billingModel') {
      return (
        <PolluterModelSelector
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          modelType='billing'
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'preMeetingModel') {
      return (
        <PolluterModelSelector
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          modelType='premeeting'
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'afterWorkModel') {
      return (
        <PolluterModelSelector
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          modelType='afterwork'
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'pricing') {
      return (
        <PolluterPricingCrud
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          polluterType={subSection.polluter.type}
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'boilerPack') {
      return (
        <PolluterPricingVariantCrud
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          variant='boilerpack'
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'itePrice') {
      return (
        <PolluterPricingVariantCrud
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          variant='ite'
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'products') {
      return (
        <PolluterProductForm
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'properties') {
      return (
        <PolluterPropertyForm
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          polluterType={subSection.polluter.type}
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'models') {
      return (
        <PolluterModelsCrud
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          onBack={() => setSubSection(null)}
        />
      )
    }
    if (subSection.key === 'documentsModels' || subSection.key === 'documents') {
      return (
        <PolluterDocumentsCrud
          polluterId={subSection.polluter.id}
          polluterName={subSection.polluter.name}
          onBack={() => setSubSection(null)}
        />
      )
    }

    // ── Stub for not-yet-migrated sub-CRUDs ──
    return (
      <PolluterSubSectionStub
        title={subTitles[subSection.key]}
        polluterId={subSection.polluter.id}
        polluterName={subSection.polluter.name}
        onBack={() => setSubSection(null)}
      />
    )
  }

  // ─── Main list render ────────────────────────────────────────────────────

  if (loading && items.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const sortIcon = (col: string) => {
    if (filter.order_by !== col) return 'ri-arrow-up-down-line'
    return filter.order_dir === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'
  }

  return (
    <Box>
      {error ? (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity='success' onClose={() => setSuccessMsg(null)} variant='filled'>
          {successMsg}
        </Alert>
      </Snackbar>

      <Typography variant='h5' sx={{ mb: 3 }}>
        {t.isoPolluterTitle}
      </Typography>

      {/* Header buttons (theme32a: New + Export superadmin + Import superadmin) */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Button variant='contained' onClick={handleOpenCreate}>
          <i className='ri-add-line' style={{ marginRight: 6 }} />
          {t.isoPolluterNew}
        </Button>
        {can.superadmin ? (
          <>
            <Button variant='outlined' onClick={handleExportAll}>
              <i className='ri-upload-2-line' style={{ marginRight: 6 }} />
              {t.isoPolluterExport}
            </Button>
            <Button variant='outlined' onClick={() => setImportDialogOpen(true)}>
              <i className='ri-download-2-line' style={{ marginRight: 6 }} />
              {t.isoPolluterImport}
            </Button>
          </>
        ) : null}
        <Box sx={{ flexGrow: 1 }} />
        <Button variant='outlined' onClick={() => window.history.back()}>
          <i className='ri-arrow-left-line' style={{ marginRight: 6 }} />
          {t.statusCrudBack}
        </Button>
      </Box>

      {/* Active status filter + Reset */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
        <TextField
          select
          size='small'
          label={t.isoPolluterIsActiveCol}
          value={filter.is_active}
          onChange={e => setFilter(prev => ({ ...prev, is_active: e.target.value }))}
          SelectProps={{ native: true }}
          sx={{ minWidth: 120 }}
        >
          <option value='ALL'>—</option>
          <option value='YES'>YES</option>
          <option value='NO'>NO</option>
        </TextField>
        <Button size='small' variant='text' onClick={() => setFilter(emptyFilter)}>
          {t.isoPolluterReset}
        </Button>
      </Box>

      <Card variant='outlined'>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer component={Paper} elevation={0}>
            <Table size='small'>
              <TableHead>
                {/* Column headers with sort */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    {t.isoPolluterName} <i className={sortIcon('name')} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('commercial')}>
                    {t.isoPolluterCommercial} <i className={sortIcon('commercial')} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('postcode')}>
                    {t.isoPolluterPostcode} <i className={sortIcon('postcode')} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('city')}>
                    {t.isoPolluterCity} <i className={sortIcon('city')} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('phone')}>
                    {t.isoPolluterPhone} <i className={sortIcon('phone')} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t.isoPolluterIsDefaultCol}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t.isoPolluterTypeCol}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t.isoPolluterIsActiveCol}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align='right'>
                    {t.isoPolluterActions}
                  </TableCell>
                </TableRow>
                {/* Per-column search row (theme32a pattern) */}
                <TableRow>
                  <TableCell />
                  <TableCell>
                    <TextField
                      size='small'
                      variant='standard'
                      placeholder='…'
                      value={filter.name}
                      onChange={e => setFilter(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      variant='standard'
                      placeholder='…'
                      value={filter.commercial}
                      onChange={e => setFilter(prev => ({ ...prev, commercial: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      variant='standard'
                      placeholder='…'
                      value={filter.postcode}
                      onChange={e => setFilter(prev => ({ ...prev, postcode: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      variant='standard'
                      placeholder='…'
                      value={filter.city}
                      onChange={e => setFilter(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      variant='standard'
                      placeholder='…'
                      value={filter.phone}
                      onChange={e => setFilter(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align='center' sx={{ py: 4, color: 'text.secondary' }}>
                      {t.isoPolluterEmpty}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.commercial || '—'}</TableCell>
                      <TableCell>{item.postcode || '—'}</TableCell>
                      <TableCell>{item.city || '—'}</TableCell>
                      <TableCell>{item.phone || '—'}</TableCell>
                      <TableCell>
                        {isYes(item.is_default) ? (
                          <i className='ri-checkbox-circle-fill' style={{ color: '#10B981' }} />
                        ) : (
                          <i className='ri-close-circle-line' style={{ color: '#9CA3AF' }} />
                        )}
                      </TableCell>
                      <TableCell>{item.type || '—'}</TableCell>
                      <TableCell>
                        <Tooltip title={isYes(item.is_active) ? 'YES' : 'NO'}>
                          <Switch
                            size='small'
                            checked={isYes(item.is_active)}
                            onChange={() => handleToggleActive(item)}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                        {/* 17 actions theme32a — gated by individual credentials */}
                        {can.view ? (
                          <Tooltip title={t.isoPolluterRowAction_Edit}>
                            <IconButton size='small' color='primary' onClick={() => handleOpenEdit(item)}>
                              <i className='ri-edit-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.contacts ? (
                          <Tooltip title={t.isoPolluterRowAction_Contacts}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'contacts', polluter: item })}>
                              <i className='ri-team-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.layer ? (
                          <Tooltip title={t.isoPolluterRowAction_Layer}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'layer', polluter: item })}>
                              <i className='ri-stack-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.pricing ? (
                          <Tooltip title={t.isoPolluterRowAction_Pricing}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'pricing', polluter: item })}>
                              <i className='ri-money-euro-circle-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {/* Products button — iso5 (always visible if user has settings access) */}
                        <Tooltip title={t.isoPolluterRowAction_Products}>
                          <IconButton size='small' onClick={() => setSubSection({ key: 'products', polluter: item })}>
                            <i className='ri-product-hunt-line' />
                          </IconButton>
                        </Tooltip>

                        {can.properties ? (
                          <Tooltip title={t.isoPolluterRowAction_Properties}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'properties', polluter: item })}>
                              <i className='ri-money-euro-circle-line' style={{ color: '#DC2626' }} />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.boilerPack ? (
                          <Tooltip title={t.isoPolluterRowAction_BoilerPack}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'boilerPack', polluter: item })}>
                              <i className='ri-fire-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.itePrice && ['ITE', 'TYPE1', 'TYPE2'].includes((item.type ?? '').toUpperCase()) ? (
                          <Tooltip title={t.isoPolluterRowAction_ITEPrice}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'itePrice', polluter: item })}>
                              <i className='ri-home-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.models ? (
                          <Tooltip title={t.isoPolluterRowAction_Models}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'models', polluter: item })}>
                              <i className='ri-file-text-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.docModels ? (
                          <Tooltip title={t.isoPolluterRowAction_DocumentsModels}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'documentsModels', polluter: item })}>
                              <i className='ri-file-text-line' style={{ color: '#10B981' }} />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.preMeeting ? (
                          <Tooltip title={t.isoPolluterRowAction_PreMeetingModel}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'preMeetingModel', polluter: item })}>
                              <i className='ri-file-line' style={{ color: '#3B82F6' }} />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.quotationModel ? (
                          <Tooltip title={t.isoPolluterRowAction_QuotationModel}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'quotationModel', polluter: item })}>
                              <i className='ri-file-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.documents ? (
                          <Tooltip title={t.isoPolluterRowAction_Documents}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'documents', polluter: item })}>
                              <i className='ri-folder-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.billingModel ? (
                          <Tooltip title={t.isoPolluterRowAction_BillingModel}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'billingModel', polluter: item })}>
                              <i className='ri-file-line' style={{ color: '#DC2626' }} />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.afterWork ? (
                          <Tooltip title={t.isoPolluterRowAction_AfterWorkModel}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'afterWorkModel', polluter: item })}>
                              <i className='ri-file-line' style={{ color: '#F59E0B' }} />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.recipients ? (
                          <Tooltip title={t.isoPolluterRowAction_Recipients}>
                            <IconButton size='small' onClick={() => setSubSection({ key: 'recipients', polluter: item })}>
                              <i className='ri-building-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.exportOne ? (
                          <Tooltip title={t.isoPolluterRowAction_Export}>
                            <IconButton size='small' onClick={() => handleExportOne(item.id)}>
                              <i className='ri-upload-2-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.delete ? (
                          <Tooltip title={t.isoPolluterRowAction_Edit + ' / ' + t.statusCrudDelete}>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => {
                                setDeletingItem(item)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <i className='ri-close-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {can.remove ? (
                          <Tooltip title={t.isoPolluterRemove}>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => {
                                setRemovingItem(item)
                                setRemoveDialogOpen(true)
                              }}
                            >
                              <i className='ri-delete-bin-line' />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ─── Create / Edit Dialog (4 sections) ───────────────────────────── */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>{editingItem ? t.isoPolluterEdit : t.isoPolluterCreate}</DialogTitle>
        <DialogContent>
          {/* Général */}
          <Typography variant='subtitle2' sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
            {t.isoPolluterSectionGeneral}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t.isoPolluterName} value={formData.name} onChange={e => set('name', e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t.isoPolluterCommercial} value={formData.commercial} onChange={e => set('commercial', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t.isoPolluterType} value={formData.type} onChange={e => set('type', e.target.value)} inputProps={{ maxLength: 32 }} />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={<Switch checked={isYes(formData.is_active)} onChange={e => set('is_active', e.target.checked ? 'YES' : 'NO')} />}
                label={t.isoPolluterIsActive}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={<Switch checked={isYes(formData.is_default)} onChange={e => set('is_default', e.target.checked ? 'YES' : 'NO')} />}
                label={t.isoPolluterIsDefault}
              />
            </Grid>
          </Grid>

          {/* Contact */}
          <Typography variant='subtitle2' sx={{ mt: 3, mb: 1, color: 'text.secondary' }}>{t.isoPolluterSectionContact}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label={t.isoPolluterEmail} value={formData.email} onChange={e => set('email', e.target.value)} type='email' /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label={t.isoPolluterWeb} value={formData.web} onChange={e => set('web', e.target.value)} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label={t.isoPolluterPhone} value={formData.phone} onChange={e => set('phone', e.target.value)} inputProps={{ maxLength: 20 }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label={t.isoPolluterMobile} value={formData.mobile} onChange={e => set('mobile', e.target.value)} inputProps={{ maxLength: 20 }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label={t.isoPolluterFax} value={formData.fax} onChange={e => set('fax', e.target.value)} inputProps={{ maxLength: 20 }} /></Grid>
          </Grid>

          {/* Adresse */}
          <Typography variant='subtitle2' sx={{ mt: 3, mb: 1, color: 'text.secondary' }}>{t.isoPolluterSectionAddress}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label={t.isoPolluterAddress1} value={formData.address1} onChange={e => set('address1', e.target.value)} inputProps={{ maxLength: 128 }} /></Grid>
            <Grid item xs={12}><TextField fullWidth label={t.isoPolluterAddress2} value={formData.address2} onChange={e => set('address2', e.target.value)} inputProps={{ maxLength: 128 }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label={t.isoPolluterPostcode} value={formData.postcode} onChange={e => set('postcode', e.target.value)} inputProps={{ maxLength: 10 }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label={t.isoPolluterCity} value={formData.city} onChange={e => set('city', e.target.value)} inputProps={{ maxLength: 64 }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label={t.isoPolluterCountry} value={formData.country} onChange={e => set('country', e.target.value)} inputProps={{ maxLength: 2 }} helperText='ISO 3166-1 alpha-2' /></Grid>
          </Grid>

          {/* Business */}
          <Typography variant='subtitle2' sx={{ mt: 3, mb: 1, color: 'text.secondary' }}>{t.isoPolluterSectionBusiness}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}><TextField fullWidth label={t.isoPolluterApe} value={formData.ape} onChange={e => set('ape', e.target.value)} inputProps={{ maxLength: 10 }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label={t.isoPolluterSiret} value={formData.siret} onChange={e => set('siret', e.target.value)} inputProps={{ maxLength: 20 }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label={t.isoPolluterTva} value={formData.tva} onChange={e => set('tva', e.target.value)} inputProps={{ maxLength: 30 }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>{t.cancel}</Button>
          <Button variant='contained' onClick={handleSave} disabled={saving || !formData.name.trim()}>
            {saving ? t.saving : t.save}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Delete (soft) Dialog ────────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>{t.isoPolluterDeleteTitle}</DialogTitle>
        <DialogContent>
          <Typography>{t.isoPolluterDeleteSoftConfirm}</Typography>
          {deletingItem ? (
            <Typography variant='body2' sx={{ mt: 1, fontWeight: 'bold' }}>{deletingItem.name}</Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>{t.cancel}</Button>
          <Button variant='contained' color='warning' onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : t.statusCrudDelete}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Remove (hard) Dialog ────────────────────────────────────────── */}
      <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>{t.isoPolluterRemove}</DialogTitle>
        <DialogContent>
          <Typography>{t.isoPolluterRemoveConfirm}</Typography>
          {removingItem ? (
            <Typography variant='body2' sx={{ mt: 1, fontWeight: 'bold' }}>{removingItem.name}</Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)} disabled={removing}>{t.cancel}</Button>
          <Button variant='contained' color='error' onClick={handleConfirmRemove} disabled={removing}>
            {removing ? <CircularProgress size={20} /> : t.isoPolluterRemove}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Import Dialog ───────────────────────────────────────────────── */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{t.isoPolluterImport}</DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ mb: 2 }}>{t.isoPolluterImportFile}</Typography>
          <input
            type='file'
            accept='.csv,text/csv'
            onChange={e => setImportFile(e.target.files?.[0] ?? null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setImportDialogOpen(false); setImportFile(null) }} disabled={importing}>
            {t.cancel}
          </Button>
          <Button variant='contained' onClick={handleImport} disabled={importing || !importFile}>
            {importing ? <CircularProgress size={20} /> : t.isoPolluterImportRun}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
