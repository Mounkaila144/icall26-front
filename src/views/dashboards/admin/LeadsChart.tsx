'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const LeadsChart = () => {
  // Hooks
  const theme = useTheme()

  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    stroke: { width: 0 },
    labels: ['Nouveaux', 'En Contact', 'Qualifiés', 'Perdus'],
    colors: ['var(--mui-palette-success-main)', 'var(--mui-palette-info-main)', 'var(--mui-palette-warning-main)', 'var(--mui-palette-error-main)'],
    dataLabels: {
      enabled: false
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '13px',
      labels: {
        colors: 'var(--mui-palette-text-secondary)'
      },
      markers: {
        offsetX: theme.direction === 'rtl' ? 5 : -5
      },
      itemMargin: {
        horizontal: 9
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
              fontSize: '0.875rem',
              color: 'var(--mui-palette-text-secondary)'
            },
            value: {
              offsetY: -15,
              fontSize: '1.375rem',
              color: 'var(--mui-palette-text-primary)',
              formatter: value => `${value}`
            },
            total: {
              show: true,
              fontSize: '0.875rem',
              label: 'Total',
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
      <CardHeader title='Leads par Statut' action={<OptionMenu options={['Rafraîchir', 'Mettre à jour']} />} />
      <CardContent className='flex flex-col gap-1'>
        <AppReactApexCharts type='donut' height={219} width='100%' series={[45, 32, 28, 15]} options={options} />
        <div className='flex flex-col items-center gap-1'>
          <Typography variant='h5'>120 Leads</Typography>
          <Typography variant='body2'>Total des leads actifs</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default LeadsChart
