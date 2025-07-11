"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "./Header"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardLayoutProps {
  children: ReactNode
  currentPage?: string
}

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [mounted, loading, isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.replace("/")
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner text="Chargement..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header currentPage={currentPage} onLogout={handleLogout} user={user} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
