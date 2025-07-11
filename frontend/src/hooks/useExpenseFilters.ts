"use client"

import { useState, useMemo } from "react"
import type { Expense } from "@/types"

export function useExpenseFilters(expenses: Expense[]) {
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const availableMonths = useMemo(() => {
    return Array.from(
      new Set(
        expenses.map((expense) => {
          const date = new Date(expense.date)
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        }),
      ),
    )
      .sort()
      .reverse()
  }, [expenses])

  const availableCategories = useMemo(() => {
    return Array.from(new Set(expenses.map((expense) => expense.category.name))).sort()
  }, [expenses])

  const filteredExpenses = useMemo(() => {
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

    return filtered
  }, [expenses, selectedMonth, selectedCategory, searchTerm])

  const clearFilters = () => {
    setSelectedMonth("")
    setSelectedCategory("")
    setSearchTerm("")
  }

  const isFiltered = selectedMonth || selectedCategory || searchTerm

  return {
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
  }
}
