'use client'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Third-party Components
import classnames from 'classnames'

const Award = () => {
  // Hooks
  const theme = useTheme()

  return (
    <Card className='relative bs-full'>
      <CardContent>
        <div className='flex flex-col items-start gap-2.5'>
          <div className='flex flex-col'>
            <Typography variant='h5'>
              Félicitations <span className='font-bold'>Admin!</span> 🎉
            </Typography>
            <Typography variant='subtitle1'>Meilleur mois de l'année</Typography>
          </div>
          <div className='flex flex-col'>
            <Typography variant='h5' color='primary.main'>
              245 Contrats
            </Typography>
            <Typography>85% de l'objectif 🚀</Typography>
          </div>
          <Button size='small' variant='contained'>
            Voir les Détails
          </Button>
        </div>
        <img
          src='/images/cards/trophy.png'
          className={classnames('is-[106px] absolute block-end-0 inline-end-5', {
            'scale-x-[-1]': theme.direction === 'rtl'
          })}
        />
      </CardContent>
    </Card>
  )
}

export default Award
