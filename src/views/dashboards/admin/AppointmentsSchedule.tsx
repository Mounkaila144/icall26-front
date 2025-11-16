// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Types Imports
import type { ThemeColor } from '@core/types'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

type DataType = {
  avatarSrc: string
  title: string
  subtitle: string
  chipLabel: string
  chipColor?: ThemeColor
}

// Vars
const data: DataType[] = [
  {
    avatarSrc: '/images/avatars/1.png',
    title: 'Rendez-vous avec Martin Dubois',
    subtitle: '18 Nov | 09:00-10:30',
    chipLabel: 'Nouveau Lead',
    chipColor: 'success'
  },
  {
    avatarSrc: '/images/avatars/2.png',
    title: 'Signature contrat - Sophie Laurent',
    subtitle: '19 Nov | 14:00-15:00',
    chipLabel: 'Contrat',
    chipColor: 'primary'
  },
  {
    avatarSrc: '/images/avatars/3.png',
    title: 'Présentation devis - Tech Solutions',
    subtitle: '20 Nov | 10:30-12:00',
    chipLabel: 'Devis',
    chipColor: 'warning'
  },
  {
    avatarSrc: '/images/avatars/4.png',
    title: 'Suivi client - Marie Petit',
    subtitle: '21 Nov | 16:00-17:00',
    chipLabel: 'Suivi',
    chipColor: 'info'
  },
  {
    avatarSrc: '/images/avatars/5.png',
    title: 'Négociation - Entreprise ABC',
    subtitle: '22 Nov | 11:00-12:30',
    chipLabel: 'Négociation',
    chipColor: 'secondary'
  },
  {
    avatarSrc: '/images/avatars/6.png',
    title: 'Closing - Digital Corp',
    subtitle: '23 Nov | 15:00-16:00',
    chipLabel: 'Closing',
    chipColor: 'error'
  }
]

const AppointmentsSchedule = () => {
  return (
    <Card>
      <CardHeader title='Planning des Rendez-vous' action={<OptionMenu options={['Rafraîchir', 'Partager', 'Reprogrammer']} />} />
      <CardContent className='flex flex-col gap-6'>
        {data.map((item, index) => (
          <div key={index} className='flex items-center gap-4'>
            <CustomAvatar variant='rounded' src={item.avatarSrc} size={38} />
            <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='font-medium'>
                  {item.title}
                </Typography>
                <div className='flex items-center gap-2'>
                  <i className='ri-calendar-line text-base text-textSecondary' />
                  <Typography variant='body2'>{item.subtitle}</Typography>
                </div>
              </div>
              <Chip label={item.chipLabel} color={item.chipColor} size='small' variant='tonal' />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default AppointmentsSchedule
