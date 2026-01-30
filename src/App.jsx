import { useState } from "react"
import Auth from "./components/Auth"
import Dashboard from "./components/Dashboard"

export default function App() {
  const [logged, setLogged] = useState(!!localStorage.getItem("token"))

  return logged ? <Dashboard /> : <Auth onLogin={() => setLogged(true)} />
}

