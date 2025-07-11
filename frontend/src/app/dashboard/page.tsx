"use client"

import type React from "react"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useAuth } from "@/contexts/AuthContext"
import { useExpenses } from "@/hooks/useExpenses"
import type { Expense } from "@/types"

export default function DashboardPage() {
  const { user, showWelcome } = useAuth()
  const { expenses, loading } = useExpenses()
  const router = useRouter()

  const [totalExpenses, setTotalExpenses] = useState(0)
  const [monthlyChange, setMonthlyChange] = useState(0)
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])

  const currentPage = "dashboard"

  const quickActions = useMemo(
    () => [
      { href: "/expenses/new", label: "➕ Ajouter une dépense", key: "add-expense" },
      { href: "/categories", label: "📁 Gérer les catégories", key: "categories" },
      { href: "/summary", label: "📊 Voir les résumés", key: "summary" },
    ],
    [],
  )

  const handleMouseDown = useCallback(
    (href: string, e: React.MouseEvent) => {
      e.preventDefault()
      router.push(href)
    },
    [router],
  )

  const calculateStatistics = useCallback((expensesData: Expense[]) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const currentMonthExpenses = expensesData.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })

    const lastMonthExpenses = expensesData.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear
    })

    const currentTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const lastTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    let change = 0
    if (lastTotal > 0) {
      change = ((currentTotal - lastTotal) / lastTotal) * 100
    } else if (currentTotal > 0) {
      change = 100
    }

    setTotalExpenses(currentTotal)
    setMonthlyChange(change)
  }, [])

  useEffect(() => {
    if (expenses.length > 0) {
      calculateStatistics(expenses)
      const sortedExpenses = expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
      setRecentExpenses(sortedExpenses)
    }
  }, [expenses, calculateStatistics])

  if (loading) {
    return (
      <DashboardLayout currentPage={currentPage}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPage={currentPage}>
      {showWelcome && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <p className="font-medium">Bienvenue, {user?.email?.split("@")[0] || "Utilisateur"} ! 👋</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h2>
        <p className="text-gray-600">Gérez vos dépenses et suivez votre budget</p>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💰</span>
              Dépenses ce mois
            </CardTitle>
            <CardDescription>Total de vos dépenses mensuelles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalExpenses.toFixed(2)} €</div>
            <p className="text-sm text-gray-500 mt-1">
              {monthlyChange > 0 ? "+" : ""}
              {monthlyChange.toFixed(1)}% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Gérez vos dépenses rapidement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map(({ href, label, key }) => (
              <div
                key={key}
                onMouseDown={(e) => handleMouseDown(href, e)}
                className="w-full text-left px-4 py-3 rounded-md transition text-gray-600 hover:text-blue-600 hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 select-none"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    router.push(href)
                  }
                }}
              >
                {label}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dépenses récentes</CardTitle>
            <CardDescription>Vos dernières transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{expense.title}</p>
                      <p className="text-sm text-gray-500">{expense.category.name}</p>
                      <p className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <span className="font-bold text-red-600">{expense.amount.toFixed(2)} €</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">Aucune dépense récente</p>
              )}
            </div>

            {recentExpenses.length > 0 && (
              <div className="mt-4">
                <div
                  onMouseDown={(e) => handleMouseDown("/expenses", e)}
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition text-sm cursor-pointer select-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      router.push("/expenses")
                    }
                  }}
                >
                  Voir toutes les dépenses
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
