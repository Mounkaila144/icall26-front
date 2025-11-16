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
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const series = [{ name: 'Nouveaux Clients', data: [28, 45, 38, 52, 48, 65, 72] }]

const ClientsGrowth = () => {
  // Hooks
  const theme = useTheme()

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: {
        opacityTo: 0.2,
        opacityFrom: 1,
        shadeIntensity: 0,
        type: 'horizontal',
        stops: [0, 100, 100]
      }
    },
    stroke: {
      width: 5,
      lineCap: 'round'
    },
    legend: { show: false },
    colors: ['var(--mui-palette-success-main)'],
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
        bottom: -10
      }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      labels: {
        style: {
          fontSize: '0.9375rem',
          colors: 'var(--mui-palette-text-disabled)'
        }
      }
    },
    yaxis: {
      labels: { show: false }
    },
    markers: {
      size: 8,
      strokeWidth: 6,
      strokeOpacity: 1,
      hover: { size: 8 },
      colors: ['transparent'],
      strokeColors: 'transparent',
      discrete: [
        {
          size: 8,
          seriesIndex: 0,
          fillColor: 'var(--mui-palette-background-paper)',
          strokeColor: 'var(--mui-palette-success-main)',
          dataPointIndex: series[0].data.length - 1
        }
      ]
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.xl,
        options: {
          chart: { height: 122 }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          chart: { height: 153 }
        }
      }
    ]
  }

  return (
    <Card>
      <CardHeader
        title='Croissance des Clients'
        subheader='Cette semaine'
        action={<OptionMenu options={['Rafraîchir', 'Partager', 'Télécharger']} />}
      />
      <CardContent>
        <AppReactApexCharts type='line' height={137} width='100%' options={options} series={series} />
        <div className='flex items-center gap-4 mbs-6'>
          <CustomAvatar variant='rounded' color='success' skin='light'>
            <i className='ri-group-line' />
          </CustomAvatar>
          <div className='flex flex-col'>
            <Typography variant='h5'>+72 Clients</Typography>
            <Typography>Nouveaux clients cette semaine</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ClientsGrowth
