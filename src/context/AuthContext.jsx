import { createContext, useState } from "react"
import { api } from "../api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"))

  const login = async (username, password) => {
    const data = await api("/login", "POST", { username, password })
    localStorage.setItem("token", data.access_token)
    setToken(data.access_token)
  }

  const register = async (username, password) => {
    const data = await api("/register", "POST", { username, password })
    localStorage.setItem("token", data.access_token)
    setToken(data.access_token)
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

