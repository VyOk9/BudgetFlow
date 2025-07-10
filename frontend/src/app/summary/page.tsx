"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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

interface CategorySummary {
  category: string
  total: number
  percentage: number
}

interface MonthlyData {
  month: string
  total: number
}

export default function SummaryPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    loadExpenses(token)
  }, [router])

  const loadExpenses = async (token: string) => {
    try {
      const res = await fetch("http://localhost:3001/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setExpenses(data)
        calculateSummaries(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des dépenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSummaries = (expensesData: Expense[]) => {
    const total = expensesData.reduce((sum, expense) => sum + expense.amount, 0)
    setTotalExpenses(total)

    const categoryTotals: { [key: string]: number } = {}
    expensesData.forEach((expense) => {
      const categoryName = expense.category.name
      categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount
    })

    const categorySummaryData = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        total: amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)

    setCategorySummary(categorySummaryData)

    const monthlyTotals: { [key: string]: number } = {}
    expensesData.forEach((expense) => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
      monthlyTotals[monthName] = (monthlyTotals[monthName] || 0) + expense.amount
    })

    const monthlyDataArray = Object.entries(monthlyTotals)
      .map(([month, total]) => ({
        month,
        total,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

    setMonthlyData(monthlyDataArray)
  }

  const generatePDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Résumé des Dépenses - BudgetFlow</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            h1 { 
              color: #2563eb; 
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
            }
            h2 { 
              color: #1f2937; 
              margin-top: 30px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #f8fafc; 
              font-weight: bold;
            }
            .total { 
              font-weight: bold; 
              color: #dc2626; 
              font-size: 1.2em;
            }
            .summary-box {
              background-color: #f0f9ff;
              border: 1px solid #0ea5e9;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .date {
              text-align: right;
              color: #6b7280;
              font-size: 0.9em;
              margin-bottom: 20px;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
          </style>
        </head>
        <body>
          <div class="date">Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</div>
          
          <h1>📊 Résumé des Dépenses - BudgetFlow</h1>
          
          <div class="summary-box">
            <h3>💰 Total des dépenses</h3>
            <p class="total">${totalExpenses.toFixed(2)} €</p>
            <p>Basé sur ${expenses.length} transaction(s)</p>
          </div>
          
          <h2>📁 Dépenses par Catégorie</h2>
          <table>
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Montant</th>
                <th>Pourcentage</th>
              </tr>
            </thead>
            <tbody>
              ${categorySummary
                .map(
                  (item) =>
                    `<tr>
                      <td>${item.category}</td>
                      <td>${item.total.toFixed(2)} €</td>
                      <td>${item.percentage.toFixed(1)}%</td>
                    </tr>`,
                )
                .join("")}
            </tbody>
          </table>

          <h2>📋 Détail de toutes les Dépenses</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              ${expenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(
                  (expense) =>
                    `<tr>
                      <td>${new Date(expense.date).toLocaleDateString("fr-FR")}</td>
                      <td>${expense.title}</td>
                      <td>${expense.category.name}</td>
                      <td>${expense.amount.toFixed(2)} €</td>
                    </tr>`,
                )
                .join("")}
            </tbody>
          </table>
          
          <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 0.9em;">
            <p>Document généré automatiquement par BudgetFlow</p>
          </div>
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `resume_depenses_${new Date().toISOString().split("T")[0]}.html`
    link.style.display = "none"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Date", "Titre", "Catégorie", "Montant"],
      ...expenses.map((expense) => [
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
    link.setAttribute("download", `depenses_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#ca8a04", "#9333ea", "#c2410c", "#0891b2", "#be123c"]

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
            <Link href="/expenses" className="text-gray-600 hover:text-blue-600">
              Dépenses
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-blue-600">
              Catégories
            </Link>
            <Link href="/summary" className="text-blue-600 font-medium">
              Résumés
            </Link>
          </nav>
          <Button onClick={() => localStorage.removeItem("token") || router.push("/")} variant="outline" size="sm">
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Résumés Financiers</h2>
            <p className="text-gray-600 mt-1">Analysez vos habitudes de dépenses</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" disabled={expenses.length === 0}>
              📊 Export CSV
            </Button>
            <Button onClick={generatePDF} variant="outline" disabled={expenses.length === 0}>
              📄 Télécharger PDF
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💰</span>
              Total des Dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600">{totalExpenses.toFixed(2)} €</p>
              <p className="text-sm text-gray-500 mt-2">Basé sur {expenses.length} transaction(s)</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              {categorySummary.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categorySummary}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {categorySummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)} €`, "Montant"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Évolution Mensuelle</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)} €`, "Dépenses"]} />
                    <Bar dataKey="total" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📁</span>
              Dépenses par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categorySummary.length > 0 ? (
              <div className="space-y-4">
                {categorySummary.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{item.category}</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{item.total.toFixed(2)} €</span>
                        <span className="text-sm text-gray-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Aucune donnée de catégorie disponible</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
