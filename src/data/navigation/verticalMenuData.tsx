// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  // SuperAdmin Section
  {
    label: 'SuperAdmin',
    isSection: true,
    children: [
      {
        label: 'Sites',
        icon: 'tabler-building',
        href: '/superadmin/sites'
      },
      {
        label: 'Modules',
        icon: 'tabler-puzzle',
        href: '/superadmin/modules'
      }
    ]
  }
]

export default verticalMenuData
