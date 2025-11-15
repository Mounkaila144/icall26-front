'use client'

// React Imports
import { Fragment } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { User } from '../../types/user.types'

interface UserFunctionsModalProps {
  open: boolean
  onClose: () => void
  user: User | null
}

const UserFunctionsModal = ({ open, onClose, user }: UserFunctionsModalProps) => {
  if (!user) return null

  // Parse functions list (assuming it's comma-separated or similar format)
  const functions = user.functions_list
    ? user.functions_list.split(',').map(fn => fn.trim()).filter(Boolean)
    : []

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle className='flex items-center justify-between'>
        <div>
          <Typography variant='h5'>User Functions</Typography>
          <Typography variant='body2' color='text.secondary'>
            {user.username} - {user.full_name}
          </Typography>
        </div>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {functions.length === 0 ? (
          <Typography color='text.secondary' className='text-center py-8'>
            No functions assigned to this user
          </Typography>
        ) : (
          <div className='space-y-4'>
            <Typography variant='body2' color='text.secondary'>
              Total: {functions.length} function{functions.length > 1 ? 's' : ''}
            </Typography>
            <div className='grid grid-cols-1 gap-2'>
              {functions.map((func, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 p-3 rounded border border-gray-200 hover:bg-gray-50'
                >
                  <Chip
                    label={index + 1}
                    size='small'
                    color='primary'
                    variant='outlined'
                    className='min-w-[40px]'
                  />
                  <Typography>{func}</Typography>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose} variant='outlined' color='secondary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserFunctionsModal
