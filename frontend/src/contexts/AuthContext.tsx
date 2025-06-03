"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode<User>(token)
        setUser(decoded)
      } catch (error) {
        console.error("Error decoding token:", error)
        localStorage.removeItem("token")
      }
    }
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
