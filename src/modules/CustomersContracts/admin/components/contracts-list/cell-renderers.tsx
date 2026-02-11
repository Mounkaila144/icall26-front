import type { ReactNode } from 'react'

import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

import type { ContractTranslations } from '../../hooks/useContractTranslations'
import type { CustomerContract } from '../../../types'
import type { ChipColor } from './helpers'
import { isYes, formatDate, formatDateTime } from './helpers'

export const textCell = (value: any, className?: string, color?: string): ReactNode => (
  <Typography variant='body2' {...(className && { className })} {...(color && { color })}>
    {value ?? '-'}
  </Typography>
)

export const booleanChip = (
  value: boolean,
  trueLabel: string,
  falseLabel: string,
  trueColor: ChipColor = 'success',
  falseColor: ChipColor = 'warning'
): ReactNode => (
  <Chip variant='tonal' label={value ? trueLabel : falseLabel} size='small' color={value ? trueColor : falseColor} />
)

export const statusChip = (status: { name?: string; value?: string; color?: string } | null | undefined): ReactNode => {
  if (!status) return <Typography variant='body2'>-</Typography>
  return (
    <Chip
      label={status.value ?? status.name}
      size='small'
      sx={{ backgroundColor: status.color || undefined, color: status.color ? '#fff' : undefined }}
    />
  )
}

/**
 * Multi-line date cell matching Symfony template behavior.
 * Shows opened_at as main date, then sub-dates with labels (opc_at, pre_meeting_at, etc.)
 * Also shows hold icons if is_hold / is_hold_admin are set.
 */
export const dateCellMultiLine = (r: CustomerContract, t: ContractTranslations): ReactNode => {
  const holdFlags: ReactNode[] = []

  if (isYes(r.is_hold)) {
    holdFlags.push(
      <Chip key='hold' label='H' size='small' color='warning' sx={{ height: 18, fontSize: '0.65rem', mr: 0.5 }} />
    )
  }

  if (isYes(r.is_hold_admin)) {
    holdFlags.push(
      <Chip key='hold-admin' label='HA' size='small' color='error' sx={{ height: 18, fontSize: '0.65rem', mr: 0.5 }} />
    )
  }

  const subDates: { label: string; value: string }[] = []

  if (r.opc_at) subDates.push({ label: t.dateInstallAh, value: formatDateTime(r.opc_at) })
  if (r.pre_meeting_at) subDates.push({ label: t.datePreVisit, value: formatDateTime(r.pre_meeting_at) })
  if (r.apf_at) subDates.push({ label: t.dateSentLabel, value: formatDate(r.apf_at) })
  if (r.payment_at) subDates.push({ label: t.datePaymentLabel, value: formatDate(r.payment_at) })
  if (r.sav_at) subDates.push({ label: t.dateInstall, value: formatDateTime(r.sav_at) })
  if (r.closed_at) subDates.push({ label: t.dateClosure, value: formatDateTime(r.closed_at) })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, whiteSpace: 'nowrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {holdFlags}
        <Typography variant='body2' sx={{ fontWeight: 500 }}>
          {formatDate(r.opened_at)}
        </Typography>
      </Box>
      {subDates.map((sd, i) => (
        <Typography key={i} variant='caption' sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
          <em>{sd.label}:</em> {sd.value}
        </Typography>
      ))}
    </Box>
  )
}

/**
 * Customer cell matching Symfony: company on first line, LASTNAME FIRSTNAME on second.
 */
export const customerCell = (r: CustomerContract): ReactNode => {
  const c = r.customer
  if (!c) return <Typography variant='body2'>-</Typography>

  const fullName = (c.lastname || c.firstname)
    ? `${(c.lastname || '').toUpperCase()} ${(c.firstname || '').toUpperCase()}`.trim()
    : c.nom_prenom?.toUpperCase() || '-'

  return (
    <Box>
      {c.company ? (
        <>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>{c.company}</Typography>
          <Typography variant='body2'>{fullName}</Typography>
        </>
      ) : (
        <Typography variant='body2' sx={{ fontWeight: 500 }}>{fullName}</Typography>
      )}
    </Box>
  )
}

/**
 * Phone cell matching Symfony: phone as clickable tel: link, mobile below.
 */
export const phoneCell = (r: CustomerContract): ReactNode => {
  const c = r.customer
  if (!c) return <Typography variant='body2'>-</Typography>

  return (
    <Box>
      {c.phone ? (
        <Typography variant='body2'>
          <a href={`tel:${c.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{c.phone}</a>
        </Typography>
      ) : null}
      {c.mobile ? (
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {c.mobile}
        </Typography>
      ) : null}
      {!c.phone && !c.mobile ? <Typography variant='body2'>-</Typography> : null}
    </Box>
  )
}
