import { createContext, useState } from "react"
import { api } from "../api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"))

  const login = async (username, password) => {
    try {
      const data = await api("/login", "POST", { username, password })

      console.log("LOGIN RESPONSE =", data)

      const receivedToken = data.access_token

      if (!receivedToken) {
        alert("Identifiants invalides")
        return
      }

      localStorage.setItem("token", receivedToken) // ✅ string pure
      setToken(receivedToken)

    } catch (err) {
      console.error(err)
      alert("Erreur connexion")
    }
  }

  const register = async (username, password) => {
    try {
      const data = await api("/register", "POST", { username, password })

      console.log("REGISTER RESPONSE =", data)

      const receivedToken = data.access_token

      if (!receivedToken) {
        alert("Erreur inscription")
        return
      }

      localStorage.setItem("token", receivedToken) // ✅ string pure
      setToken(receivedToken)

    } catch (err) {
      console.error(err)
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

