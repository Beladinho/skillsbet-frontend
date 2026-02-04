import { useContext } from "react"
import { AuthProvider, AuthContext } from "./context/AuthContext"
import Auth from "./components/Auth"
import Dashboard from "./pages/Dashboard"

function AppContent() {
  const token = localStorage.getItem("token");
  
  return token ? <Dashboard /> : <Auth />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}


