// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const horizontalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): HorizontalMenuDataType[] => [
  // Add your custom menu items here
  // Example:
  // {
  //   label: 'Dashboard',
  //   icon: 'ri-home-smile-line',
  //   href: '/dashboard'
  // }
]

export default horizontalMenuData
