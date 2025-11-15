'use client'

// React Imports
import { useEffect, useState, useMemo, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Popover from '@mui/material/Popover'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import FormControlLabel from '@mui/material/FormControlLabel'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Translation Imports
import { useTranslation } from '@/shared/i18n'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { User } from '../../types/user.types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import UserFunctionsModal from './UserFunctionsModal'
import UserGroupsModal from './UserGroupsModal'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Context Imports
import { useUsersContext } from './UsersList'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type UserWithAction = User & {
  action?: string
}

type UserStatusType = {
  [key: string]: ThemeColor
}

// Vars
const userStatusObj: UserStatusType = {
  YES: 'success',
  NO: 'secondary'
}

const userLockStatusObj: UserStatusType = {
  YES: 'error',
  NO: 'success'
}

// Available columns configuration
const AVAILABLE_COLUMNS = [
  { id: 'username', label: 'Username', defaultVisible: true },
  { id: 'firstname', label: 'Firstname', defaultVisible: true },
  { id: 'lastname', label: 'Lastname', defaultVisible: true },
  { id: 'email', label: 'Email', defaultVisible: true },
  { id: 'code_by_email', label: 'Code by Email', defaultVisible: false },
  { id: 'teams', label: 'Teams', defaultVisible: false },
  { id: 'profiles', label: 'Profiles', defaultVisible: false },
  { id: 'groups', label: 'Groups', defaultVisible: true },
  { id: 'permissions', label: 'Permissions', defaultVisible: false },
  { id: 'functions', label: 'Functions', defaultVisible: false },
  { id: 'state', label: 'State', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: false },
  { id: 'managers_teams', label: 'Managers/Teams', defaultVisible: false },
  { id: 'creator', label: 'Creator', defaultVisible: false },
  { id: 'created_at', label: 'Date Creation', defaultVisible: true },
  { id: 'lastlogin', label: 'Last Login', defaultVisible: true },
  { id: 'last_password_gen', label: 'Last Password Gen', defaultVisible: false },
  { id: 'locked', label: 'Locked', defaultVisible: false },
  { id: 'locked_at', label: 'Locked At', defaultVisible: false },
  { id: 'unlocked_by', label: 'Unlocked By', defaultVisible: false },
  { id: 'number_of_try', label: 'Number of Tries', defaultVisible: false },
  { id: 'callcenter', label: 'Callcenter', defaultVisible: false },
  { id: 'company', label: 'Company', defaultVisible: false }
] as const

const STORAGE_KEY = 'userListTableColumns'

// Column Definitions
const columnHelper = createColumnHelper<UserWithAction>()

const UserListTable = () => {
  // Translation
  const { t, locale } = useTranslation('Users')

  // Debug: Log current locale
  useEffect(() => {
    console.log('📊 [UserListTable] Current locale:', locale);
    console.log('📊 [UserListTable] Sample translation test:', t('Users Management'));
  }, [locale, t]);

  // Context
  const {
    users,
    loading,
    pagination,
    params,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    refresh,
    deleteUser
  } = useUsersContext()

  // Load column visibility from localStorage
  const getInitialColumnVisibility = () => {
    if (typeof window === 'undefined') return {}

    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return {}
      }
    }

    // Default visibility
    const defaultVisibility: Record<string, boolean> = {}

    AVAILABLE_COLUMNS.forEach(col => {
      defaultVisibility[col.id] = col.defaultVisible
    })

    return defaultVisibility
  }

  // States
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null)
  const [functionsModalOpen, setFunctionsModalOpen] = useState(false)
  const [groupsModalOpen, setGroupsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(getInitialColumnVisibility)
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null)

  // Save column visibility to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility))
    }
  }, [columnVisibility])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(globalFilter)
    }, 500)

    return () => clearTimeout(timer)
  }, [globalFilter, setSearch])

  // Handle column visibility
  const handleToggleColumn = useCallback((columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }))
  }, [])

  const handleOpenColumnMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget)
  }, [])

  const handleCloseColumnMenu = useCallback(() => {
    setColumnMenuAnchor(null)
  }, [])

  const handleShowAllColumns = useCallback(() => {
    const allVisible: Record<string, boolean> = {}

    AVAILABLE_COLUMNS.forEach(col => {
      allVisible[col.id] = true
    })
    setColumnVisibility(allVisible)
  }, [])

  const handleHideAllColumns = useCallback(() => {
    const allHidden: Record<string, boolean> = {}

    AVAILABLE_COLUMNS.forEach(col => {
      allHidden[col.id] = false
    })
    setColumnVisibility(allHidden)
  }, [])

  const handleResetColumns = useCallback(() => {
    const defaultVisibility: Record<string, boolean> = {}

    AVAILABLE_COLUMNS.forEach(col => {
      defaultVisibility[col.id] = col.defaultVisible
    })
    setColumnVisibility(defaultVisibility)
  }, [])

  // Handle functions modal
  const handleOpenFunctionsModal = useCallback((user: User) => {
    setSelectedUser(user)
    setFunctionsModalOpen(true)
  }, [])

  const handleCloseFunctionsModal = useCallback(() => {
    setFunctionsModalOpen(false)
    setSelectedUser(null)
  }, [])

  // Handle groups modal
  const handleOpenGroupsModal = useCallback((user: User) => {
    setSelectedUser(user)
    setGroupsModalOpen(true)
  }, [])

  const handleCloseGroupsModal = useCallback(() => {
    setGroupsModalOpen(false)
    setSelectedUser(null)
  }, [])

  // Handle sorting
  const handleSort = useCallback(
    (column: string) => {
      if (loading) return

      let newDirection: 'asc' | 'desc' = 'asc'

      if (sorting?.column === column) {
        // Toggle direction or clear sorting
        if (sorting.direction === 'asc') {
          newDirection = 'desc'
        } else {
          // Clear sorting
          setSorting(null)
          updateParams({
            filter: {
              ...params.filter,
              order: undefined
            }
          })
          return
        }
      }

      setSorting({ column, direction: newDirection })
      updateParams({
        filter: {
          ...params.filter,
          order: { [column]: newDirection }
        }
      })
    },
    [loading, sorting, params, updateParams]
  )

  // Helper to create sortable header
  const createSortableHeader = useCallback(
    (label: string, column: string) => {
      return (
        <div
          className='flex items-center gap-2 cursor-pointer select-none'
          onClick={() => handleSort(column)}
        >
          <span>{label}</span>
          {sorting?.column === column && (
            <i
              className={classnames('text-xl', {
                'ri-arrow-up-s-line': sorting.direction === 'asc',
                'ri-arrow-down-s-line': sorting.direction === 'desc'
              })}
            />
          )}
        </div>
      )
    },
    [handleSort, sorting]
  )

  const allColumns = useMemo<ColumnDef<UserWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('id', {
        id: 'id',
        header: () => createSortableHeader('#', 'id'),
        cell: ({ row }) => <Typography>{row.original.id || '-'}</Typography>
      }),
      columnHelper.accessor('username', {
        id: 'username',
        header: () => createSortableHeader(t('Username'), 'username'),
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ sex: row.original.sex, full_name: row.original.full_name })}
            <Typography color='text.primary' className='font-medium'>
              {row.original.username}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('firstname', {
        id: 'firstname',
        header: () => createSortableHeader(t('Firstname'), 'firstname'),
        cell: ({ row }) => <Typography>{row.original.firstname || '-'}</Typography>
      }),
      columnHelper.accessor('lastname', {
        id: 'lastname',
        header: () => createSortableHeader(t('Lastname'), 'lastname'),
        cell: ({ row }) => <Typography>{row.original.lastname || '-'}</Typography>
      }),
      columnHelper.accessor('email', {
        id: 'email',
        header: () => createSortableHeader(t('Email'), 'email'),
        cell: ({ row }) => <Typography>{row.original.email || '-'}</Typography>
      }),
      columnHelper.accessor('is_secure_by_code', {
        id: 'code_by_email',
        header: t('Code by Email'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.is_secure_by_code === 'YES' ? t('Yes') : t('No')}
            size='small'
            color={row.original.is_secure_by_code === 'YES' ? 'success' : 'secondary'}
          />
        )
      }),
      columnHelper.accessor('teams_list', {
        id: 'teams',
        header: t('Teams'),
        cell: ({ row }) => <Typography className='max-w-xs truncate'>{row.original.teams_list || '-'}</Typography>
      }),
      columnHelper.accessor('profiles', {
        id: 'profiles',
        header: t('Profiles'),
        cell: ({ row }) => <Typography className='max-w-xs truncate'>{row.original.profiles || '-'}</Typography>
      }),
      columnHelper.accessor('groups_list', {
        id: 'groups',
        header: t('Groups'),
        cell: ({ row }) => {
          const groupsCount = row.original.groups.length > 0
            ? row.original.groups.length
            : row.original.groups_list
              ? row.original.groups_list.split(',').filter(Boolean).length
              : 0

          return groupsCount > 0 ? (
            <Chip
              variant='tonal'
              label={`${groupsCount} ${groupsCount > 1 ? t('groups') : t('group')}`}
              size='small'
              color='success'
              onClick={() => handleOpenGroupsModal(row.original)}
              className='cursor-pointer'
            />
          ) : (
            <Typography>-</Typography>
          )
        }
      }),
      columnHelper.accessor('permissions', {
        id: 'permissions',
        header: t('Permissions'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={`${row.original.permissions} ${t('perms')}`}
            size='small'
            color='info'
          />
        )
      }),
      columnHelper.accessor('functions_list', {
        id: 'functions',
        header: t('Functions'),
        cell: ({ row }) => {
          const functionsCount = row.original.functions_list
            ? row.original.functions_list.split(',').filter(Boolean).length
            : 0

          return functionsCount > 0 ? (
            <Chip
              variant='tonal'
              label={`${functionsCount} ${functionsCount > 1 ? t('functions') : t('function')}`}
              size='small'
              color='info'
              onClick={() => handleOpenFunctionsModal(row.original)}
              className='cursor-pointer'
            />
          ) : (
            <Typography>-</Typography>
          )
        }
      }),
      columnHelper.accessor('is_active', {
        id: 'state',
        header: t('State'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.is_active === 'YES' ? t('Active') : t('Inactive')}
            size='small'
            color={userStatusObj[row.original.is_active]}
          />
        )
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: t('Status'),
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original.status}
          </Typography>
        )
      }),
      columnHelper.accessor('team_id', {
        id: 'managers_teams',
        header: t('Managers/Teams'),
        cell: ({ row }) => <Typography>{row.original.team_id || '-'}</Typography>
      }),
      columnHelper.accessor('creator_id', {
        id: 'creator',
        header: t('Creator'),
        cell: ({ row }) => <Typography>{row.original.creator_id || '-'}</Typography>
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: () => createSortableHeader(t('Date Creation'), 'created_at'),
        cell: ({ row }) => (
          <Typography>
            {row.original.created_at ? new Date(row.original.created_at).toLocaleString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('lastlogin', {
        id: 'lastlogin',
        header: () => createSortableHeader(t('Last Login'), 'lastlogin'),
        cell: ({ row }) => (
          <Typography>
            {row.original.lastlogin ? new Date(row.original.lastlogin).toLocaleString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('last_password_gen', {
        id: 'last_password_gen',
        header: () => createSortableHeader(t('Last Password Gen'), 'last_password_gen'),
        cell: ({ row }) => (
          <Typography>
            {row.original.last_password_gen ? new Date(row.original.last_password_gen).toLocaleString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('is_locked', {
        id: 'locked',
        header: t('Locked'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.is_locked === 'YES' ? t('Locked') : t('Unlocked')}
            size='small'
            color={userLockStatusObj[row.original.is_locked]}
          />
        )
      }),
      columnHelper.accessor('locked_at', {
        id: 'locked_at',
        header: t('Locked At'),
        cell: ({ row }) => (
          <Typography>
            {row.original.locked_at ? new Date(row.original.locked_at).toLocaleString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('unlocked_by', {
        id: 'unlocked_by',
        header: t('Unlocked By'),
        cell: ({ row }) => <Typography>{row.original.unlocked_by || '-'}</Typography>
      }),
      columnHelper.accessor('number_of_try', {
        id: 'number_of_try',
        header: t('Number of Tries'),
        cell: ({ row }) => <Typography>{row.original.number_of_try}</Typography>
      }),
      columnHelper.accessor('callcenter_id', {
        id: 'callcenter',
        header: t('Callcenter'),
        cell: ({ row }) => <Typography>{row.original.callcenter_id || '-'}</Typography>
      }),
      columnHelper.accessor('company_id', {
        id: 'company',
        header: t('Company'),
        cell: ({ row }) => <Typography>{row.original.company_id || '-'}</Typography>
      }),
      columnHelper.accessor('action', {
        header: t('Actions'),
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton
              size='small'
              onClick={async () => {
                if (confirm(t('Are you sure you want to delete this user?'))) {
                  try {
                    await deleteUser(row.original.id)
                  } catch (error) {
                    console.error('Failed to delete user:', error)
                  }
                }
              }}
            >
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
            <IconButton size='small'>
              <i className='ri-eye-line text-textSecondary' />
            </IconButton>
            <IconButton size='small'>
              <i className='ri-edit-box-line text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [t, deleteUser, createSortableHeader, handleOpenFunctionsModal, handleOpenGroupsModal]
  )

  // Filter columns based on visibility
  const columns = useMemo(() => {
    return allColumns.filter(column => {
      if (column.id === 'select' || column.id === 'action') return true

      return columnVisibility[column.id as string] !== false
    })
  }, [allColumns, columnVisibility])

  const table = useReactTable({
    data: users as User[],
    columns,
    state: {
      rowSelection
    },
    pageCount: pagination.last_page,
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel()
  })

  const getAvatar = (params: Pick<User, 'sex' | 'full_name'>) => {
    const { sex, full_name } = params

    // Determine avatar based on gender
    // "MR" = homme, sinon (MS, MRS, etc.) = femme
    if (sex === 'MR' || sex === 'Mr') {
      return <CustomAvatar src='/images/avatars/1.png' skin='light' size={34} />
    } else {
      return <CustomAvatar src='/images/avatars/4.png' skin='light' size={34} />
    }
  }

  return (
    <Card>
      <CardHeader title={t('Users Management')} className='pbe-4' />
      <Divider />
      <div className='flex justify-between gap-4 p-5 flex-col items-start sm:flex-row sm:items-center'>
        <div className='flex gap-2'>
          <Button
            color='secondary'
            variant='outlined'
            startIcon={<i className='ri-upload-2-line' />}
            className='max-sm:is-full'
            disabled={loading}
          >
            {t('Export')}
          </Button>
          <Button
            color='secondary'
            variant='outlined'
            startIcon={<i className='ri-settings-3-line' />}
            onClick={handleOpenColumnMenu}
            className='max-sm:is-full'
          >
            {t('Columns')}
          </Button>
        </div>
        <div className='flex items-center gap-x-4 max-sm:gap-y-4 flex-col max-sm:is-full sm:flex-row'>
          <TextField
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={t('Search User')}
            size='small'
            className='max-sm:is-full'
            disabled={loading}
          />
          <Button
            variant='contained'
            startIcon={loading ? <CircularProgress size={20} color='inherit' /> : <i className='ri-refresh-line' />}
            onClick={refresh}
            disabled={loading}
            className='max-sm:is-full'
          >
            {loading ? t('Loading...') : t('Refresh')}
          </Button>
        </div>
      </div>

      {/* Column Visibility Popover */}
      <Popover
        open={Boolean(columnMenuAnchor)}
        anchorEl={columnMenuAnchor}
        onClose={handleCloseColumnMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <div className='p-4' style={{ width: 300 }}>
          <div className='flex items-center justify-between mb-4'>
            <Typography variant='h6'>{t('Show Columns')}</Typography>
            <IconButton size='small' onClick={handleCloseColumnMenu}>
              <i className='ri-close-line' />
            </IconButton>
          </div>
          <Divider className='mb-2' />
          <div className='flex gap-2 mb-4'>
            <Button size='small' onClick={handleShowAllColumns} variant='outlined'>
              {t('Show All')}
            </Button>
            <Button size='small' onClick={handleHideAllColumns} variant='outlined'>
              {t('Hide All')}
            </Button>
            <Button size='small' onClick={handleResetColumns} variant='outlined'>
              {t('Reset')}
            </Button>
          </div>
          <Divider className='mb-2' />
          <List dense className='max-h-96 overflow-y-auto'>
            {AVAILABLE_COLUMNS.map(column => (
              <ListItem key={column.id} disablePadding>
                <ListItemButton onClick={() => handleToggleColumn(column.id)}>
                  <FormControlLabel
                    control={<Checkbox checked={columnVisibility[column.id] !== false} />}
                    label={t(column.label)}
                    className='w-full m-0'
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </div>
      </Popover>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  <Box className='flex justify-center items-center' sx={{ py: 10 }}>
                    <CircularProgress />
                  </Box>
                </td>
              </tr>
            </tbody>
          ) : users.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  <Box sx={{ py: 6 }}>
                    <Typography>{t('No data available')}</Typography>
                  </Box>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => {
                return (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component='div'
        className='border-bs'
        count={pagination.total}
        rowsPerPage={pagination.per_page}
        page={pagination.current_page - 1}
        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' },
          disabled: loading
        }}
        slotProps={{
          actions: {
            nextButton: {
              disabled: loading || pagination.current_page >= pagination.last_page
            },
            previousButton: {
              disabled: loading || pagination.current_page <= 1
            }
          }
        }}
        onPageChange={(_, page) => {
          if (!loading) {
            setPage(page + 1)
          }
        }}
        onRowsPerPageChange={e => {
          if (!loading) {
            setPageSize(Number(e.target.value))
          }
        }}
      />

      {/* Functions Modal */}
      <UserFunctionsModal open={functionsModalOpen} onClose={handleCloseFunctionsModal} user={selectedUser} />

      {/* Groups Modal */}
      <UserGroupsModal open={groupsModalOpen} onClose={handleCloseGroupsModal} user={selectedUser} />
    </Card>
  )
}

export default UserListTable
