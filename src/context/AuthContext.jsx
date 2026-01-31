import { createContext, useState, useEffect } from "react"
import { api } from "../api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"))

  const login = async (username, password) => {
    const data = await api("/login", "POST", { username, password })
    if (data.access_token) {
      localStorage.setItem("token", data.access_token)
      setToken(data.access_token)
    } else {
      alert("Identifiants invalides")
    }
  }

  const register = async (username, password) => {
    const data = await api("/register", "POST", { username, password })
    if (data.access_token) {
      localStorage.setItem("token", data.access_token)
      setToken(data.access_token)
    } else {
      alert("Erreur inscription")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
