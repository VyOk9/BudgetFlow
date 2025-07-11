"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Expense } from "@/types"

interface ExpensesListProps {
  expenses: Expense[]
  onDelete: (id: number) => void
  onClearFilters?: () => void
  isFiltered?: boolean
}

export function ExpensesList({ expenses, onDelete, onClearFilters, isFiltered = false }: ExpensesListProps) {
  const sortedExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isFiltered ? "Dépenses filtrées" : "Toutes les dépenses"}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedExpenses.length > 0 ? (
          <div className="space-y-4">
            {sortedExpenses.map((expense) => (
              <ExpenseItem key={expense.id} expense={expense} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <EmptyExpensesList isFiltered={isFiltered} onClearFilters={onClearFilters} />
        )}
      </CardContent>
    </Card>
  )
}

function ExpenseItem({ expense, onDelete }: { expense: Expense; onDelete: (id: number) => void }) {
  return (
    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{expense.title}</h3>
        <p className="text-sm text-gray-500">{expense.category.name}</p>
        <p className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString("fr-FR")}</p>
      </div>
      <div className="flex items-center space-x-4">
        <span className="font-bold text-red-600 text-lg">{expense.amount.toFixed(2)} €</span>
        <Button onClick={() => onDelete(expense.id)} variant="destructive" size="sm">
          Supprimer
        </Button>
      </div>
    </div>
  )
}

function EmptyExpensesList({
  isFiltered,
  onClearFilters,
}: {
  isFiltered: boolean
  onClearFilters?: () => void
}) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-4">
        {isFiltered ? "Aucune dépense ne correspond aux filtres" : "Aucune dépense trouvée"}
      </p>
      {isFiltered && onClearFilters ? (
        <Button onClick={onClearFilters} variant="outline">
          Effacer les filtres
        </Button>
      ) : (
        <Button onClick={() => (window.location.href = "/expenses/new")}>Ajouter votre première dépense</Button>
      )}
    </div>
  )
}
