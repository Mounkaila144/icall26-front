// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'

const AdminDashboard = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Bienvenue dans l'administration multi-tenant</p>
    </div>
  )
}

export default AdminDashboard
