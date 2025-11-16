'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

type DataType = {
  title: string
  subtitle: string
  avatarIcon: string
  avatarColor: string
  progress: number
  progressColor: 'primary' | 'success' | 'warning' | 'error' | 'info'
}

// Vars
const data: DataType[] = [
  {
    progress: 85,
    title: '245',
    subtitle: 'Contrats signés',
    avatarIcon: 'ri-file-text-line',
    progressColor: 'primary',
    avatarColor: 'primary'
  },
  {
    progress: 72,
    title: '120',
    subtitle: 'Leads actifs',
    avatarIcon: 'ri-user-add-line',
    progressColor: 'success',
    avatarColor: 'success'
  },
  {
    progress: 64,
    title: '68',
    subtitle: 'Devis signés',
    avatarIcon: 'ri-file-check-line',
    progressColor: 'warning',
    avatarColor: 'warning'
  },
  {
    progress: 90,
    title: '156',
    subtitle: 'Rendez-vous planifiés',
    avatarIcon: 'ri-calendar-check-line',
    progressColor: 'info',
    avatarColor: 'info'
  }
]

const MonthlyPerformance = () => {
  return (
    <Card>
      <CardHeader
        title='Performance Mensuelle'
        subheader='Objectifs de Novembre'
        action={<OptionMenu options={['Rafraîchir', 'Partager', 'Voir détails']} />}
      />
      <CardContent className='flex flex-col gap-6'>
        {data.map((item, index) => (
          <div key={index} className='flex items-center gap-4'>
            <CustomAvatar variant='rounded' color={item.avatarColor as any} skin='light'>
              <i className={item.avatarIcon} />
            </CustomAvatar>
            <div className='flex flex-col gap-1 is-full'>
              <div className='flex justify-between items-center'>
                <Typography className='font-medium' color='text.primary'>
                  {item.subtitle}
                </Typography>
                <Typography variant='body2' className='font-medium'>
                  {item.title}
                </Typography>
              </div>
              <LinearProgress
                color={item.progressColor}
                value={item.progress}
                variant='determinate'
                className='bs-2'
              />
              <Typography variant='body2' color='text.disabled'>
                {item.progress}% de l'objectif
              </Typography>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default MonthlyPerformance
