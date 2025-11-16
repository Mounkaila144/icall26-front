// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Components Imports
import CardStatVertical from '@components/card-statistics/Vertical'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const DashboardSuperAdmin = async () => {
  // Vars
  const serverMode = await getServerMode()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant='h4' gutterBottom>
              Super Admin Dashboard
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Welcome to the Super Admin Dashboard. This is your central hub for managing the entire system.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='1,234'
          title='Total Users'
          trendNumber='12%'
          chipText='Last Month'
          avatarColor='primary'
          avatarIcon='ri-user-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='89'
          title='Total Admins'
          trendNumber='8%'
          chipText='Last Month'
          avatarColor='success'
          avatarIcon='ri-admin-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='456'
          title='Active Sessions'
          trendNumber='22%'
          chipText='Last Week'
          avatarColor='warning'
          avatarIcon='ri-pulse-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='99.9%'
          title='System Uptime'
          trendNumber='0.1%'
          chipText='Last 30 Days'
          avatarColor='info'
          avatarIcon='ri-server-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
    </Grid>
  )
}

export default DashboardSuperAdmin
