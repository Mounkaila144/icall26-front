'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Divider from '@mui/material/Divider'

import DocumentSettings from '@/modules/CustomersDocuments/admin/components/DocumentSettings'
import ContractSettings from '@/modules/CustomersContracts/admin/components/ContractSettings'
import MeetingSettings from '@/modules/CustomersMeetings/admin/components/MeetingSettings'
import StatusConfigCrud from './StatusConfigCrud'
import RangeConfigCrud from './RangeConfigCrud'
import ZoneConfigCrud from './ZoneConfigCrud'
import CompanyConfigCrud from './CompanyConfigCrud'
import TypeConfigCrud from './TypeConfigCrud'
import CampaignConfigCrud from './CampaignConfigCrud'
import FormConfigCrud from './FormConfigCrud'
import { useConfigTranslations } from '../hooks/useConfigTranslations'

// ─── Types ───────────────────────────────────────────────

type ConfigSection = string | null

interface ConfigItem {
  key: string
  labelKey: string
  descriptionKey: string
  icon: string
  color: string
}

interface ConfigBlock {
  key: string
  labelKey: string
  icon: string
  color: string
  items: ConfigItem[]
}

// ─── Configuration Blocks ────────────────────────────────

const configBlocks: ConfigBlock[] = [
  {
    key: 'contrat',
    labelKey: 'blockContract',
    icon: 'ri-file-list-3-line',
    color: '#7C3AED',
    items: [
      {
        key: 'contract-settings',
        labelKey: 'itemContractSettings',
        descriptionKey: 'itemContractSettingsDesc',
        icon: 'ri-settings-4-line',
        color: '#059669',
      },
      {
        key: 'contract-statuses',
        labelKey: 'itemContractStatuses',
        descriptionKey: 'itemContractStatusesDesc',
        icon: 'ri-list-check-2',
        color: '#2563EB',
      },
      {
        key: 'contract-admin-statuses',
        labelKey: 'itemAdminStatuses',
        descriptionKey: 'itemAdminStatusesDesc',
        icon: 'ri-shield-check-line',
        color: '#7C3AED',
      },
      {
        key: 'contract-install-statuses',
        labelKey: 'itemInstallStatuses',
        descriptionKey: 'itemInstallStatusesDesc',
        icon: 'ri-download-2-line',
        color: '#D97706',
      },
      {
        key: 'contract-time-statuses',
        labelKey: 'itemTimeStatuses',
        descriptionKey: 'itemTimeStatusesDesc',
        icon: 'ri-time-line',
        color: '#0891B2',
      },
      {
        key: 'contract-opc-statuses',
        labelKey: 'itemOpcStatuses',
        descriptionKey: 'itemOpcStatusesDesc',
        icon: 'ri-flag-line',
        color: '#BE185D',
      },
      {
        key: 'contract-ranges',
        labelKey: 'itemRanges',
        descriptionKey: 'itemRangesDesc',
        icon: 'ri-calendar-event-line',
        color: '#4F46E5',
      },
      {
        key: 'contract-zones',
        labelKey: 'itemZones',
        descriptionKey: 'itemZonesDesc',
        icon: 'ri-map-pin-line',
        color: '#059669',
      },
      {
        key: 'contract-companies',
        labelKey: 'itemCompanies',
        descriptionKey: 'itemCompaniesDesc',
        icon: 'ri-building-line',
        color: '#6366F1',
      },
      {
        key: 'documents',
        labelKey: 'itemDocuments',
        descriptionKey: 'itemDocumentsDesc',
        icon: 'ri-folder-settings-line',
        color: '#2563EB',
      },
      {
        key: 'contract-forms',
        labelKey: 'itemForms',
        descriptionKey: 'itemFormsDesc',
        icon: 'ri-file-edit-line',
        color: '#F59E0B',
      },
    ],
  },
  {
    key: 'meeting',
    labelKey: 'blockMeeting',
    icon: 'ri-calendar-2-line',
    color: '#8B5CF6',
    items: [
      {
        key: 'meeting-settings',
        labelKey: 'itemMeetingSettings',
        descriptionKey: 'itemMeetingSettingsDesc',
        icon: 'ri-settings-4-line',
        color: '#06B6D4',
      },
      {
        key: 'meeting-statuses',
        labelKey: 'itemMeetingStatuses',
        descriptionKey: 'itemMeetingStatusesDesc',
        icon: 'ri-list-check-2',
        color: '#2563EB',
      },
      {
        key: 'meeting-status-calls',
        labelKey: 'itemMeetingStatusCalls',
        descriptionKey: 'itemMeetingStatusCallsDesc',
        icon: 'ri-phone-line',
        color: '#059669',
      },
      {
        key: 'meeting-status-leads',
        labelKey: 'itemMeetingStatusLeads',
        descriptionKey: 'itemMeetingStatusLeadsDesc',
        icon: 'ri-user-star-line',
        color: '#D97706',
      },
      {
        key: 'meeting-types',
        labelKey: 'itemMeetingTypes',
        descriptionKey: 'itemMeetingTypesDesc',
        icon: 'ri-price-tag-3-line',
        color: '#7C3AED',
      },
      {
        key: 'meeting-campaigns',
        labelKey: 'itemMeetingCampaigns',
        descriptionKey: 'itemMeetingCampaignsDesc',
        icon: 'ri-megaphone-line',
        color: '#BE185D',
      },
      {
        key: 'meeting-ranges',
        labelKey: 'itemMeetingRanges',
        descriptionKey: 'itemMeetingRangesDesc',
        icon: 'ri-calendar-event-line',
        color: '#4F46E5',
      },
      {
        key: 'meeting-forms',
        labelKey: 'itemForms',
        descriptionKey: 'itemFormsDesc',
        icon: 'ri-file-edit-line',
        color: '#F59E0B',
      },
    ],
  },
]

// ─── Components ──────────────────────────────────────────

function ConfigItemCard({
  item,
  t,
  onClick,
}: {
  item: ConfigItem
  t: Record<string, string>
  onClick: () => void
}) {
  return (
    <Paper
      variant='outlined'
      sx={{
        p: 2.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: item.color,
          boxShadow: `0 4px 12px ${item.color}20`,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: `${item.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <i className={item.icon} style={{ fontSize: 22, color: item.color }} />
        </Box>
        <Box>
          <Typography variant='subtitle2' fontWeight={600}>
            {t[item.labelKey] ?? item.labelKey}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {t[item.descriptionKey] ?? item.descriptionKey}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

function BlockHeader({ block, t }: { block: ConfigBlock; t: Record<string, string> }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: `${block.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <i className={block.icon} style={{ fontSize: 20, color: block.color }} />
      </Box>
      <Typography variant='h6' fontWeight={600}>
        {t[block.labelKey] ?? block.labelKey}
      </Typography>
    </Box>
  )
}

// ─── Main Page ───────────────────────────────────────────

export default function ConfigurationPage() {
  const [activeSection, setActiveSection] = useState<ConfigSection>(null)
  const t = useConfigTranslations()

  // Render active section content
  if (activeSection) {
    const block = configBlocks.find((b) => b.items.some((i) => i.key === activeSection))
    const item = block?.items.find((i) => i.key === activeSection)

    return (
      <Box>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            underline='hover'
            color='inherit'
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
            onClick={() => setActiveSection(null)}
          >
            <i className='ri-settings-3-line' style={{ fontSize: 16 }} />
            {t.pageTitle}
          </Link>
          {block ? (
            <Typography color='text.secondary'>{t[block.labelKey as keyof typeof t] ?? block.labelKey}</Typography>
          ) : null}
          {item ? (
            <Typography color='text.primary' fontWeight={500}>
              {t[item.labelKey as keyof typeof t] ?? item.labelKey}
            </Typography>
          ) : null}
        </Breadcrumbs>

        {/* Section content */}
        {activeSection === 'documents' ? <DocumentSettings /> : null}
        {activeSection === 'contract-settings' ? <ContractSettings /> : null}
        {activeSection === 'meeting-settings' ? <MeetingSettings /> : null}
        {activeSection === 'contract-statuses' ? <StatusConfigCrud type='statuses' title={t.itemContractStatuses} /> : null}
        {activeSection === 'contract-admin-statuses' ? <StatusConfigCrud type='admin-statuses' title={t.itemAdminStatuses} /> : null}
        {activeSection === 'contract-install-statuses' ? <StatusConfigCrud type='install-statuses' title={t.itemInstallStatuses} /> : null}
        {activeSection === 'contract-time-statuses' ? <StatusConfigCrud type='time-statuses' title={t.itemTimeStatuses} /> : null}
        {activeSection === 'contract-opc-statuses' ? <StatusConfigCrud type='opc-statuses' title={t.itemOpcStatuses} /> : null}
        {activeSection === 'contract-ranges' ? <RangeConfigCrud /> : null}
        {activeSection === 'contract-zones' ? <ZoneConfigCrud /> : null}
        {activeSection === 'contract-companies' ? <CompanyConfigCrud /> : null}
        {activeSection === 'meeting-statuses' ? <StatusConfigCrud type='statuses' title={t.itemMeetingStatuses} baseUrl='/admin/customersmeetings/config/statuses' /> : null}
        {activeSection === 'meeting-status-calls' ? <StatusConfigCrud type='status-calls' title={t.itemMeetingStatusCalls} baseUrl='/admin/customersmeetings/config/status-calls' /> : null}
        {activeSection === 'meeting-status-leads' ? <StatusConfigCrud type='status-leads' title={t.itemMeetingStatusLeads} baseUrl='/admin/customersmeetings/config/status-leads' /> : null}
        {activeSection === 'meeting-types' ? <TypeConfigCrud /> : null}
        {activeSection === 'meeting-campaigns' ? <CampaignConfigCrud /> : null}
        {activeSection === 'meeting-ranges' ? <RangeConfigCrud baseUrl='/admin/customersmeetings/config/ranges' title={t.meetingRangeTitle} /> : null}
        {activeSection === 'contract-forms' || activeSection === 'meeting-forms' ? <FormConfigCrud /> : null}
      </Box>
    )
  }

  // Main grid
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className='ri-settings-3-line' style={{ fontSize: 24, color: '#fff' }} />
        </Box>
        <Box>
          <Typography variant='h5' fontWeight={700}>
            {t.pageTitle}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {t.pageSubtitle}
          </Typography>
        </Box>
      </Box>

      {configBlocks.map((block) => (
        <Box key={block.key} sx={{ mb: 4 }}>
          <BlockHeader block={block} t={t as unknown as Record<string, string>} />
          <Grid container spacing={2}>
            {block.items.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.key}>
                <ConfigItemCard
                  item={item}
                  t={t as unknown as Record<string, string>}
                  onClick={() => setActiveSection(item.key)}
                />
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ mt: 3 }} />
        </Box>
      ))}
    </Box>
  )
}
