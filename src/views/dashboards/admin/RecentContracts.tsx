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
  name: string
  company: string
  amount: string
  status: string
  statusColor: ThemeColor
}

// Vars
const data: DataType[] = [
  {
    avatarSrc: '/images/avatars/1.png',
    name: 'Martin Dubois',
    company: 'Tech Solutions SAS',
    amount: '45 000€',
    status: 'Signé',
    statusColor: 'success'
  },
  {
    avatarSrc: '/images/avatars/2.png',
    name: 'Sophie Laurent',
    company: 'Digital Corp',
    amount: '28 500€',
    status: 'En cours',
    statusColor: 'warning'
  },
  {
    avatarSrc: '/images/avatars/3.png',
    name: 'Pierre Martin',
    company: 'Innovation Labs',
    amount: '62 000€',
    status: 'Signé',
    statusColor: 'success'
  },
  {
    avatarSrc: '/images/avatars/4.png',
    name: 'Marie Petit',
    company: 'StartUp ABC',
    amount: '15 000€',
    status: 'En attente',
    statusColor: 'info'
  },
  {
    avatarSrc: '/images/avatars/5.png',
    name: 'Jean Dupont',
    company: 'Entreprise XYZ',
    amount: '38 750€',
    status: 'Signé',
    statusColor: 'success'
  }
]

const RecentContracts = () => {
  return (
    <Card>
      <CardHeader title='Contrats Récents' action={<OptionMenu options={['Rafraîchir', 'Voir tout', 'Exporter']} />} />
      <CardContent className='flex flex-col gap-6'>
        {data.map((item, index) => (
          <div key={index} className='flex items-center gap-4'>
            <CustomAvatar variant='rounded' src={item.avatarSrc} size={38} />
            <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='font-medium'>
                  {item.name}
                </Typography>
                <Typography variant='body2' color='text.disabled'>
                  {item.company}
                </Typography>
              </div>
              <div className='flex items-center gap-3'>
                <Typography className='font-medium' color='text.primary'>
                  {item.amount}
                </Typography>
                <Chip label={item.status} color={item.statusColor} size='small' variant='tonal' />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default RecentContracts
