"use client"

import { useState, useEffect, useCallback } from "react"
import { ExpensesService } from "@/services/expenses.service"
import type { Expense } from "@/types"

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const data = await ExpensesService.getAll()
      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  const addExpense = async (expenseData: {
    title: string
    amount: number
    category: string
    date: string
  }) => {
    try {
      const newExpense = await ExpensesService.create(expenseData)
      setExpenses((prev) => [newExpense, ...prev])

      window.dispatchEvent(new CustomEvent("expenseAdded"))

      return newExpense
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erreur lors de l'ajout")
    }
  }

  const deleteExpense = async (id: number) => {
    try {
      await ExpensesService.delete(id)
      setExpenses((prev) => prev.filter((expense) => expense.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erreur lors de la suppression")
    }
  }

  const exportToCSV = (filteredExpenses?: Expense[], filename?: string) => {
    ExpensesService.exportToCSV(filteredExpenses || expenses, filename)
  }

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  useEffect(() => {
    const handleExpenseAdded = () => loadExpenses()
    const handleFocus = () => loadExpenses()
    const handleVisibilityChange = () => {
      if (!document.hidden) loadExpenses()
    }

    window.addEventListener("expenseAdded", handleExpenseAdded)
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("expenseAdded", handleExpenseAdded)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [loadExpenses])

  return {
    expenses,
    loading,
    error,
    addExpense,
    deleteExpense,
    exportToCSV,
    refetch: loadExpenses,
  }
}
