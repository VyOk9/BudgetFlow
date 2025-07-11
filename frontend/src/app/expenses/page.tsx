"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters"
import { ExpensesList } from "@/components/expenses/ExpensesList"
import { Button } from "@/components/ui/button"
import { useExpenses } from "@/hooks/useExpenses"
import { useExpenseFilters } from "@/hooks/useExpenseFilters"
import { useRouter } from "next/navigation"

export default function ExpensesPage() {
  const { expenses, loading, deleteExpense, exportToCSV } = useExpenses()
  const router = useRouter()
  const {
    selectedMonth,
    selectedCategory,
    searchTerm,
    availableMonths,
    availableCategories,
    filteredExpenses,
    isFiltered,
    setSelectedMonth,
    setSelectedCategory,
    setSearchTerm,
    clearFilters,
  } = useExpenseFilters(expenses)

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) return

    try {
      await deleteExpense(id)
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  const handleExport = () => {
    exportToCSV(filteredExpenses, `depenses_filtrees_${new Date().toISOString().split("T")[0]}.csv`)
  }

  const totalFiltered = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <DashboardLayout currentPage="expenses">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Chargement des dépenses..." />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPage="expenses">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mes Dépenses</h2>
          <p className="text-gray-600 mt-1">
            {filteredExpenses.length} dépense(s) • Total:{" "}
            <span className="font-bold text-red-600">{totalFiltered.toFixed(2)} €</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" disabled={filteredExpenses.length === 0}>
            📊 Export CSV
          </Button>
          <Button onClick={() => router.push("/expenses/new")}>➕ Nouvelle dépense</Button>
        </div>
      </div>

      <ExpenseFilters
        searchTerm={searchTerm}
        selectedMonth={selectedMonth}
        selectedCategory={selectedCategory}
        availableMonths={availableMonths}
        availableCategories={availableCategories}
        onSearchChange={setSearchTerm}
        onMonthChange={setSelectedMonth}
        onCategoryChange={setSelectedCategory}
        onClearFilters={clearFilters}
      />

      <ExpensesList
        expenses={filteredExpenses}
        onDelete={handleDelete}
        onClearFilters={clearFilters}
        isFiltered={isFiltered}
      />
    </DashboardLayout>
  )
}
