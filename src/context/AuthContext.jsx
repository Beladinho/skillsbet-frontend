import { createContext, useState, useEffect } from "react"
import { api } from "../api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)

  // 🔁 Charger le token au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken && storedToken !== "undefined" && storedToken !== "[object Object]") {
      setToken(storedToken)
    } else {
      localStorage.removeItem("token")
    }
  }, [])

  // 🔐 LOGIN
  const login = async (username, password) => {
    try {
      const data = await api("/login", "POST", { username, password })
      console.log("DATA LOGIN:", data)

      const realToken =
        typeof data.access_token === "string"
          ? data.access_token
          : data.access_token?.token

      if (realToken) {
        localStorage.setItem("token", realToken) // ✅ toujours une STRING
        setToken(realToken)
      } else {
        alert("Erreur récupération token")
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err)
      alert("Identifiants invalides")
    }
  }

  // 📝 REGISTER
  const register = async (username, password) => {
    try {
      const data = await api("/register", "POST", { username, password })
      console.log("DATA REGISTER:", data)

      const realToken =
        typeof data.access_token === "string"
          ? data.access_token
          : data.access_token?.token

      if (realToken) {
        localStorage.setItem("token", realToken) // ✅ toujours une STRING
        setToken(realToken)
      } else {
        alert("Erreur récupération token")
      }
    } catch (err) {
      console.error("REGISTER ERROR:", err)
      alert("Erreur inscription")
    }
  }

  // 🚪 LOGOUT
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

