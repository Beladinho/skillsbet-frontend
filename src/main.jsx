import React from "react"
import ReactDOM from "react-dom/client"
import { AuthProvider } from "./context/AuthContext"
import Dashboard from "./pages/Dashboard"
import Auth from "./pages/Auth"

function Root() {
  const token = localStorage.getItem("token")
  return token ? <Dashboard /> : <Auth />
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Root />
  </AuthProvider>
)

