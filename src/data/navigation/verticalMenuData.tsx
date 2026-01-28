// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  // Add your custom menu items here
  // Example:
  // {
  //   label: 'Dashboard',
  //   icon: 'ri-home-smile-line',
  //   href: '/dashboard'
  // }
]

export default verticalMenuData
