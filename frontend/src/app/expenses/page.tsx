"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

interface Category {
  id: number
  name: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    loadData(token)
  }, [router])

  useEffect(() => {
    filterExpenses()
  }, [expenses, selectedMonth, selectedCategory, searchTerm])

  useEffect(() => {
    const handleExpenseAdded = () => {
      const token = localStorage.getItem("token")
      if (token) {
        loadData(token)
      }
    }

    window.addEventListener("expenseAdded", handleExpenseAdded)

    const handleFocus = () => {
      const token = localStorage.getItem("token")
      if (token) {
        loadData(token)
      }
    }

    window.addEventListener("focus", handleFocus)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const token = localStorage.getItem("token")
        if (token) {
          loadData(token)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("expenseAdded", handleExpenseAdded)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const loadData = async (token: string) => {
    try {
      const expensesRes = await fetch("http://localhost:3001/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData)
      }

      await loadCategories(token)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async (token: string) => {
    try {
      const categoriesRes = await fetch("http://localhost:3001/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
    }
  }

  const filterExpenses = () => {
    let filtered = expenses

    if (selectedMonth) {
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date)
        const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`
        return expenseMonth === selectedMonth
      })
    }

    if (selectedCategory) {
      filtered = filtered.filter((expense) => expense.category.name === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.category.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredExpenses(filtered)
  }

  const deleteExpense = async (id: number) => {
    const token = localStorage.getItem("token")
    if (!token) return

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) return

    try {
      const res = await fetch(`http://localhost:3001/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const updatedExpenses = expenses.filter((expense) => expense.id !== id)
        setExpenses(updatedExpenses)
        loadCategories(token)
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Date", "Titre", "Catégorie", "Montant"],
      ...filteredExpenses.map((expense) => [
        new Date(expense.date).toLocaleDateString("fr-FR"),
        expense.title,
        expense.category.name,
        expense.amount.toFixed(2),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `depenses_filtrees_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setSelectedMonth("")
    setSelectedCategory("")
    setSearchTerm("")
  }

  const availableMonths = Array.from(
    new Set(
      expenses.map((expense) => {
        const date = new Date(expense.date)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }),
    ),
  )
    .sort()
    .reverse()

  const availableCategories = Array.from(new Set(expenses.map((expense) => expense.category.name))).sort()

  const getMonthLabel = (monthValue: string) => {
    const [year, month] = monthValue.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
  }

  const totalFiltered = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">BudgetFlow</h1>
          <nav className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              Tableau de bord
            </Link>
            <Link href="/expenses" className="text-blue-600 font-medium">
              Dépenses
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-blue-600">
              Catégories
            </Link>
            <Link href="/summary" className="text-gray-600 hover:text-blue-600">
              Résumés
            </Link>
          </nav>
          <Button onClick={() => localStorage.removeItem("token") || router.push("/")} variant="outline" size="sm">
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mes Dépenses</h2>
            <p className="text-gray-600 mt-1">
              {filteredExpenses.length} dépense(s) • Total:{" "}
              <span className="font-bold text-red-600">{totalFiltered.toFixed(2)} €</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" disabled={filteredExpenses.length === 0}>
              📊 Export CSV
            </Button>
            <Button onClick={() => router.push("/expenses/new")}>➕ Nouvelle dépense</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Recherche</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Titre ou catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="month">Mois</Label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les mois</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {getMonthLabel(month)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les catégories</option>
                  {availableCategories.map((categoryName) => (
                    <option key={categoryName} value={categoryName}>
                      {categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                  Effacer les filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedMonth || selectedCategory || searchTerm ? "Dépenses filtrées" : "Toutes les dépenses"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length > 0 ? (
              <div className="space-y-4">
                {filteredExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((expense) => (
                    <div
                      key={expense.id}
                      className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{expense.title}</h3>
                        <p className="text-sm text-gray-500">{expense.category.name}</p>
                        <p className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-red-600 text-lg">{expense.amount.toFixed(2)} €</span>
                        <Button onClick={() => deleteExpense(expense.id)} variant="destructive" size="sm">
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {expenses.length === 0 ? "Aucune dépense trouvée" : "Aucune dépense ne correspond aux filtres"}
                </p>
                {expenses.length === 0 ? (
                  <Button onClick={() => router.push("/expenses/new")}>Ajouter votre première dépense</Button>
                ) : (
                  <Button onClick={clearFilters} variant="outline">
                    Effacer les filtres
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
