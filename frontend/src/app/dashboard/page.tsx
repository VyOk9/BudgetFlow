"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Expense {
  id: number
  title: string
  amount: number
  category: {
    id: number
    name: string
  }
  date: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [monthlyChange, setMonthlyChange] = useState(0)
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [showWelcome, setShowWelcome] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    const isNewLogin = localStorage.getItem("isNewLogin")
    if (isNewLogin === "true") {
      setShowWelcome(true)
      localStorage.removeItem("isNewLogin")
      setTimeout(() => setShowWelcome(false), 3000)
    }

    loadDashboardData(token)
  }, [router])

  useEffect(() => {
    const handleExpenseAdded = () => {
      const token = localStorage.getItem("token")
      if (token) {
        loadDashboardData(token)
      }
    }

    window.addEventListener("expenseAdded", handleExpenseAdded)

    return () => {
      window.removeEventListener("expenseAdded", handleExpenseAdded)
    }
  }, [])

  const loadDashboardData = async (token: string) => {
    try {
      const expensesRes = await fetch("http://localhost:3001/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()

        calculateStatistics(expensesData)

        const sortedExpenses = expensesData
          .sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
        setRecentExpenses(sortedExpenses)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = (expenses: Expense[]) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })

    const lastMonthExpenses = expenses.filter((expense) => {
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
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("isNewLogin")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {showWelcome && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <p className="font-medium">Bienvenue, {user?.email?.split("@")[0] || "Utilisateur"} ! 👋</p>
        </div>
      )}

      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">BudgetFlow</h1>
          <nav className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-blue-600 font-medium">
              Tableau de bord
            </Link>
            <Link href="/expenses" className="text-gray-600 hover:text-blue-600">
              Dépenses
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-blue-600">
              Catégories
            </Link>
            <Link href="/summary" className="text-gray-600 hover:text-blue-600">
              Résumés
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Bienvenue, {user?.email?.split("@")[0] || "Utilisateur"}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
              <Button onClick={() => router.push("/expenses/new")} className="w-full justify-start">
                ➕ Ajouter une dépense
              </Button>
              <Button onClick={() => router.push("/categories")} variant="outline" className="w-full justify-start">
                📁 Gérer les catégories
              </Button>
              <Button onClick={() => router.push("/summary")} variant="outline" className="w-full justify-start">
                📊 Voir les résumés
              </Button>
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
                  <Button onClick={() => router.push("/expenses")} variant="outline" size="sm" className="w-full">
                    Voir toutes les dépenses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
