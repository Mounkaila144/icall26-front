// Component Imports
import Login from '@/modules/UsersGuard/admin/components/LoginForm'

// Util Imports
import { getMode } from '@core/utils/serverHelpers'

const LoginPage = async () => {
  const mode = await getMode()

  return <Login mode={mode} />
}

export default LoginPage
