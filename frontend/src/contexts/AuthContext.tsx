"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import { auth } from "../services/api"

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role: string
  theaterId?: string
}

interface AuthContextType {
  user: User | null
  login: (token: string, role: string) => void
  logout: () => void
  updateUser: (user: User) => void
  isAdmin: () => boolean
  isStaff: () => boolean
  getAssignedTheater: () => string | undefined
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await auth.getProfile()
          const decoded = jwtDecode<User>(token)
          setUser({
            ...decoded,
            ...response.data
          })
        } catch (error) {
          console.error("Error verifying token:", error)
          localStorage.removeItem("token")
          setUser(null)
        }
      }
      setLoading(false)
    }

    verifyToken()
  }, [])

  const login = (token: string, role: string) => {
    try {
      const decoded = jwtDecode<User>(token)
      decoded.role = role as "customer" | "admin" | "staff"
      setUser(decoded)
      localStorage.setItem("token", token)
    } catch (error) {
      console.error("Error decoding token:", error)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  const isAdmin = () => {
    return user?.role === "admin"
  }

  const isStaff = () => {
    return user?.role === "staff"
  }

  const getAssignedTheater = () => {
    return user?.theaterId
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAdmin,
        isStaff,
        getAssignedTheater,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
