'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const QuotesStatus = () => {
  // Hooks
  const theme = useTheme()

  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    colors: ['var(--mui-palette-success-main)', 'var(--mui-palette-warning-main)', 'var(--mui-palette-error-main)'],
    stroke: { width: 0 },
    legend: { show: false },
    dataLabels: { enabled: false },
    labels: ['Signés', 'En Attente', 'Refusés'],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              fontSize: '0.875rem'
            },
            value: {
              offsetY: -15,
              fontSize: '1.5rem',
              color: 'var(--mui-palette-text-primary)',
              formatter: value => `${value}`
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '0.875rem',
              color: 'var(--mui-palette-text-secondary)',
              formatter: value => `${value.globals.seriesTotals.reduce((total: number, num: number) => total + num)}`
            }
          }
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader title='Statut des Devis' action={<OptionMenu options={['Rafraîchir', 'Voir tout']} />} />
      <CardContent className='flex flex-col gap-5'>
        <AppReactApexCharts type='donut' height={154} width='100%' series={[68, 25, 12]} options={options} />
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <div className='is-3 bs-3 rounded-sm bg-success' />
            <Typography className='font-medium' color='text.primary'>
              Devis Signés
            </Typography>
            <Typography className='font-medium mli-auto'>68</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <div className='is-3 bs-3 rounded-sm bg-warning' />
            <Typography className='font-medium' color='text.primary'>
              En Attente
            </Typography>
            <Typography className='font-medium mli-auto'>25</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <div className='is-3 bs-3 rounded-sm bg-error' />
            <Typography className='font-medium' color='text.primary'>
              Refusés
            </Typography>
            <Typography className='font-medium mli-auto'>12</Typography>
          </div>
        </div>
        <Divider />
        <div className='flex justify-between'>
          <Typography variant='body2' color='text.disabled'>
            Taux de conversion
          </Typography>
          <Typography variant='body2' color='text.disabled'>
            64.8%
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuotesStatus
