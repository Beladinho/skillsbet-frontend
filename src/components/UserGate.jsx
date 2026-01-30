import { useAuth } from "../context/AuthContext"
import AuthPage from "../pages/AuthPage"

export default function UserGate({ children }) {
  const { token } = useAuth()

  if (!token) return <AuthPage />

  return children
}
