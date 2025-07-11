import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/constants"
import type { Expense } from "@/types"

export class ExpensesService {
  static async getAll(): Promise<Expense[]> {
    return apiClient.get<Expense[]>(API_ENDPOINTS.EXPENSES)
  }

  static async create(expense: {
    title: string
    amount: number
    category: string
    date: string
  }): Promise<Expense> {
    return apiClient.post<Expense>(API_ENDPOINTS.EXPENSES, {
      ...expense,
      type: "expense",
    })
  }

  static async delete(id: number): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`${API_ENDPOINTS.EXPENSES}/${id}`)
  }

  static exportToCSV(expenses: Expense[], filename?: string): void {
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
    link.setAttribute("download", filename || `depenses_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
