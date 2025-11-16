'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const series = [
  {
    name: 'Contrats Signés',
    type: 'column',
    data: [28, 32, 25, 38, 42, 35, 45]
  },
  {
    type: 'line',
    name: 'Contrats en Cours',
    data: [18, 22, 15, 28, 32, 25, 35]
  }
]

const ContractsOverview = () => {
  // Hooks
  const theme = useTheme()

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 7,
        columnWidth: '35%',
        colors: {
          ranges: [
            {
              to: 50,
              from: 40,
              color: 'var(--mui-palette-primary-main)'
            }
          ]
        }
      }
    },
    markers: {
      size: 3.5,
      strokeWidth: 2,
      fillOpacity: 1,
      strokeOpacity: 1,
      colors: 'var(--mui-palette-background-paper)',
      strokeColors: 'var(--mui-palette-primary-main)'
    },
    stroke: {
      width: [0, 2],
      colors: ['var(--mui-palette-customColors-trackBg)', 'var(--mui-palette-primary-main)']
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    colors: ['var(--mui-palette-customColors-trackBg)'],
    grid: {
      strokeDashArray: 7,
      borderColor: 'var(--mui-palette-divider)',
      padding: {
        left: -2,
        right: 8
      }
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    xaxis: {
      categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      tickPlacement: 'on',
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      min: 0,
      max: 50,
      show: true,
      tickAmount: 3,
      labels: {
        offsetX: -10,
        formatter: value => `${value}`,
        style: {
          fontSize: '0.8125rem',
          colors: 'var(--mui-palette-text-disabled)'
        }
      }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.xl,
        options: {
          plotOptions: {
            bar: { columnWidth: '35%' }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          chart: {
            height: 210
          },
          plotOptions: {
            bar: { columnWidth: '32%', borderRadius: 7 }
          }
        }
      }
    ]
  }

  return (
    <Card>
      <CardHeader title="Vue d'ensemble des Contrats" action={<OptionMenu options={['Rafraîchir', 'Mettre à jour', 'Partager']} />} />
      <CardContent className='flex flex-col gap-6'>
        <AppReactApexCharts type='line' height={186} width='100%' series={series} options={options} />
        <div className='flex items-center gap-4'>
          <Typography variant='h4'>+38%</Typography>
          <Typography>Vos performances sont 38% 😎 meilleures que le mois dernier</Typography>
        </div>
        <Button variant='contained' color='primary'>
          Détails
        </Button>
      </CardContent>
    </Card>
  )
}

export default ContractsOverview
