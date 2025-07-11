"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ExpenseForm } from "@/components/forms/ExpenseForm"
import { useExpenses } from "@/hooks/useExpenses"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ROUTES } from "@/constants"
import { useEffect } from "react"

export default function NewExpensePage() {
  const { addExpense } = useExpenses()
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [loading, isAuthenticated, router])

  const handleSubmit = async (data: {
    title: string
    amount: number
    category: string
    date: string
  }) => {
    try {
      await addExpense(data)
      router.push("/expenses")
    } catch (error) {
      console.error("Erreur lors de l'ajout de la dépense:", error)
      throw error
    }
  }

  if (loading) {
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
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">BudgetFlow</h1>
          <Link href={ROUTES.EXPENSES} className="text-blue-600 hover:underline">
            ← Retour aux dépenses
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <ExpenseForm onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  )
}
