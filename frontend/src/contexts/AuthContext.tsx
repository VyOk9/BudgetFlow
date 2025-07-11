"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { AuthService } from "@/services/auth.service"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  showWelcome: boolean
  login: (email: string, password: string) => Promise<any>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [mounted, setMounted] = useState(false)
  const initialized = useRef(false)
  const isInitializing = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || initialized.current || isInitializing.current) return

    isInitializing.current = true

    const initAuth = () => {
      try {
        const token = AuthService.getToken()
        const userData = AuthService.getStoredUser()

        if (token && userData) {
          setUser(userData)

          if (AuthService.isNewLogin()) {
            setShowWelcome(true)
            AuthService.clearNewLoginFlag()
            setTimeout(() => setShowWelcome(false), 3000)
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        AuthService.logout()
      } finally {
        setLoading(false)
        initialized.current = true
        isInitializing.current = false
      }
    }

    setTimeout(initAuth, 100)
  }, [mounted])

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password)

      setUser(response.user)
      setShowWelcome(true)
      setTimeout(() => setShowWelcome(false), 3000)

      return response
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    try {
      AuthService.logout()
      setUser(null)
      setShowWelcome(false)
      initialized.current = false
      isInitializing.current = false
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        showWelcome,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
