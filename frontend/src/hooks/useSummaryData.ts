"use client"

import { useState, useEffect } from "react"
import type { Expense, CategorySummary, MonthlyData } from "@/types"

export function useSummaryData(expenses: Expense[]) {
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)

  useEffect(() => {
    if (expenses.length > 0) {
      calculateSummaries(expenses)
    }
  }, [expenses])

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

  return {
    categorySummary,
    monthlyData,
    totalExpenses,
  }
}
