import { useState, useCallback, useMemo } from 'react'

import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import { usePermissions } from '@/shared/contexts/PermissionsContext'
import type { CustomerMeeting } from '../../../types'
import type { MeetingTranslations } from '../../hooks/useMeetingTranslations'

type ActionType =
  | 'edit' | 'copy_ref' | 'delete'
  | 'confirm' | 'unconfirm'
  | 'cancel' | 'uncancel'
  | 'hold' | 'unhold' | 'hold_quote' | 'unhold_quote'
  | 'lock' | 'unlock'
  | 'cancel_callback'
  | 'send_sms' | 'send_email' | 'new_comment'
  | 'copy_meeting' | 'create_contract' | 'recycle'

interface MeetingActionsCellProps {
  meeting: CustomerMeeting
  onAction: (id: number, action: ActionType) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  t: MeetingTranslations
}

export default function MeetingActionsCell({ meeting, onAction, onEdit, onDelete, t }: MeetingActionsCellProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { hasCredential, permissions } = usePermissions()

  const isAuthorized = useMemo(() => {
    if (hasCredential([['superadmin', 'admin', 'meeting_owner']])) return true
    if (!hasCredential([['meeting_list_owner']])) return true

    const userId = permissions?.user_id

    if (userId != null) {
      if (userId === meeting.assistant_id) return true
      if (userId === meeting.telepro_id) return true
      if (userId === meeting.sales_id) return true
      if (userId === meeting.sale2_id) return true
    }


return false
  }, [hasCredential, permissions?.user_id, meeting.assistant_id, meeting.telepro_id, meeting.sales_id, meeting.sale2_id])

  const canViewActions = isAuthorized || hasCredential([['meeting_list_view_actions']])

  const handleOpen = useCallback((e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget), [])
  const handleClose = useCallback(() => setAnchorEl(null), [])

  const fire = useCallback((action: ActionType) => {
    handleClose()
    if (action === 'edit') onEdit(meeting.id)
    else if (action === 'delete') onDelete(meeting.id)
    else if (action === 'copy_ref') navigator.clipboard.writeText(meeting.registration)
    else onAction(meeting.id, action)
  }, [handleClose, meeting.id, meeting.registration, onAction, onEdit, onDelete])

  if (!canViewActions) {
    return <Typography variant='body2' color='text.disabled'>---</Typography>
  }

  const isHold = meeting.is_hold === 'YES'
  const isConfirmed = meeting.is_confirmed === 'YES'
  const isHoldQuote = meeting.is_hold_quote === 'YES'
  const isLocked = meeting.is_locked === 'YES'
  const isCancelled = meeting.is_cancelled === true
  const hasCallback = !!meeting.callback_at && meeting.is_callback_cancelled !== 'YES'

  const dimmedSx = isHold ? { opacity: 0.3, pointerEvents: 'none' as const } : {}

  const canEdit = hasCredential([['superadmin', 'admin', 'meeting_modify', 'meeting_view']])
  const canDelete = hasCredential([['superadmin', 'admin', 'meeting_delete']])
  const canConfirm = hasCredential([['superadmin', 'admin', 'meetings_confirmation']])
  const canCancel = hasCredential([['superadmin', 'admin', 'meeting_list_cancel']])
  const canSendSms = hasCredential([['superadmin', 'admin', 'meeting_customer_sms_send']])
  const canSendEmail = hasCredential([['superadmin', 'admin', 'meeting_customer_email_send']])
  const canNewComment = hasCredential([['superadmin', 'admin', 'meeting_list_new_comment']])
  const canHold = hasCredential([['superadmin', 'meeting_hold']])
  const canHoldQuote = hasCredential([['superadmin', 'meeting_hold_quote']])
  const canLock = hasCredential([['superadmin', 'admin', 'meeting_lock']])
  const canCancelCallback = hasCredential([['superadmin', 'admin', 'meeting_cancel_callback']])
  const canCopyMeeting = hasCredential([['superadmin', 'meeting_copy']])
  const canCreateContract = hasCredential([['superadmin', 'admin', 'meeting_create_contract']])

  const hasToggleGroup = canConfirm || canCancel
  const hasCommunicationGroup = canSendSms || canSendEmail || canNewComment
  const hasHoldGroup = canHold || canHoldQuote || canLock || canCancelCallback || canCopyMeeting || canCreateContract

  const menuItemSx = {
    fontSize: '0.875rem', py: 0.75,
    '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 32 },
    '& .MuiListItemText-root': { color: 'inherit' },
  }

  const iconSx = { fontSize: '1.125rem' }

  return (
    <>
      <IconButton size='small' onClick={handleOpen}>
        <i className='ri-more-2-fill' />
      </IconButton>
      <Menu
        anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220, py: 0.5, maxHeight: 480 } } }}
      >
        {/* ── State Toggles ── */}
        {canConfirm && (
          <MenuItem onClick={() => fire(isConfirmed ? 'unconfirm' : 'confirm')} sx={{ ...menuItemSx, color: isConfirmed ? 'success.main' : undefined }}>
            <ListItemIcon><i className={isConfirmed ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'} style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{isConfirmed ? t.actionUnconfirm : t.actionConfirm}</ListItemText>
          </MenuItem>
        )}
        {/* ── Edit ── */}
        {hasToggleGroup && canEdit && <Divider />}
        {canEdit && (
          <MenuItem onClick={() => fire('edit')} sx={{ ...menuItemSx, color: 'primary.main' }}>
            <ListItemIcon><i className='ri-edit-box-line' style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{t.actionEdit}</ListItemText>
          </MenuItem>
        )}
        {canCopyMeeting && (
          <MenuItem onClick={() => fire('copy_meeting')} sx={{ ...menuItemSx, color: 'secondary.main' }}>
            <ListItemIcon><i className='ri-file-copy-line' style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{t.actionCopyMeeting}</ListItemText>
          </MenuItem>
        )}


        {canCancel && (
          <MenuItem onClick={() => fire(isCancelled ? 'uncancel' : 'cancel')} sx={{ ...menuItemSx, ...dimmedSx, color: isCancelled ? 'success.main' : 'error.main' }}>
            <ListItemIcon><i className={isCancelled ? 'ri-arrow-go-back-line' : 'ri-forbid-line'} style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{isCancelled ? t.actionUncancel : t.actionCancel}</ListItemText>
          </MenuItem>
        )}



        {/* ── Communication ── */}
        {hasCommunicationGroup && <Divider />}
        {canSendSms && (
          <MenuItem onClick={() => fire('send_sms')} sx={{ ...menuItemSx, color: 'info.main' }}>
            <ListItemIcon><i className='ri-message-2-line' style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{t.actionSendSms}</ListItemText>
          </MenuItem>
        )}
        {canSendEmail && (
          <MenuItem onClick={() => fire('send_email')} sx={{ ...menuItemSx, color: 'info.main' }}>
            <ListItemIcon><i className='ri-mail-send-line' style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{t.actionSendEmail}</ListItemText>
          </MenuItem>
        )}
        {canNewComment && (
          <MenuItem onClick={() => fire('new_comment')} sx={{ ...menuItemSx, color: 'secondary.main' }}>
            <ListItemIcon><i className='ri-chat-new-line' style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{t.actionNewComment}</ListItemText>
          </MenuItem>
        )}

        {/* ── Hold/Lock/Copy/Contract ── */}
        {(hasHoldGroup || canDelete) && <Divider />}
        {canHold && (
          <MenuItem onClick={() => fire(isHold ? 'unhold' : 'hold')} sx={{ ...menuItemSx, color: isHold ? 'success.main' : 'warning.main' }}>
            <ListItemIcon><i className={isHold ? 'ri-lock-unlock-line' : 'ri-lock-line'} style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{isHold ? t.actionUnhold : t.actionHold}</ListItemText>
          </MenuItem>
        )}
        {canHoldQuote && (
          <MenuItem onClick={() => fire(isHoldQuote ? 'unhold_quote' : 'hold_quote')} sx={{ ...menuItemSx, color: isHoldQuote ? 'success.main' : 'warning.main' }}>
            <ListItemIcon><i className={isHoldQuote ? 'ri-lock-unlock-line' : 'ri-lock-2-line'} style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{isHoldQuote ? t.actionUnholdQuote : t.actionHoldQuote}</ListItemText>
          </MenuItem>
        )}
        {canLock && (
          <MenuItem onClick={() => fire(isLocked ? 'unlock' : 'lock')} sx={{ ...menuItemSx, color: isLocked ? 'success.main' : 'error.main' }}>
            <ListItemIcon><i className={isLocked ? 'ri-shield-check-line' : 'ri-shield-keyhole-line'} style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{isLocked ? t.actionUnlock : t.actionLock}</ListItemText>
          </MenuItem>
        )}
        {canCancelCallback && hasCallback && (
          <MenuItem onClick={() => fire('cancel_callback')} sx={{ ...menuItemSx, color: 'warning.main' }}>
            <ListItemIcon><i className='ri-phone-off-line' style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{t.actionCancelCallback}</ListItemText>
          </MenuItem>
        )}

        {canCreateContract && (
          <MenuItem onClick={() => fire('create_contract')} sx={{ ...menuItemSx, color: 'primary.main' }}>
            <ListItemIcon><i className='ri-file-add-line' style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{t.actionCreateContract}</ListItemText>
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={() => fire('delete')} sx={{ ...menuItemSx, color: 'error.main' }}>
            <ListItemIcon><i className='ri-delete-bin-7-line' style={{ ...iconSx, color: 'inherit' }} /></ListItemIcon>
            <ListItemText>{t.actionDelete}</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

export type { ActionType, MeetingActionsCellProps }
