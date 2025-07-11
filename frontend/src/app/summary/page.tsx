"use client"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { SummaryStats } from "@/components/summary/SummaryStats"
import { SummaryCharts } from "@/components/summary/SummaryCharts"
import { CategoryBreakdown } from "@/components/summary/CategoryBreakdown"
import { ExportActions } from "@/components/summary/ExportActions"
import { useExpenses } from "@/hooks/useExpenses"
import { useSummaryData } from "@/hooks/useSummaryData"

export default function SummaryPage() {
  const { expenses, loading } = useExpenses()
  const { categorySummary, monthlyData, totalExpenses } = useSummaryData(expenses)

  if (loading) {
    return (
      <DashboardLayout currentPage="summary">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Chargement des données..." />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPage="summary">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Résumés Financiers</h2>
          <p className="text-gray-600 mt-1">Analysez vos habitudes de dépenses</p>
        </div>
        <ExportActions
          expenses={expenses}
          categorySummary={categorySummary}
          totalExpenses={totalExpenses}
          disabled={expenses.length === 0}
        />
      </div>

      <SummaryStats totalExpenses={totalExpenses} expenseCount={expenses.length} />
      <SummaryCharts categorySummary={categorySummary} monthlyData={monthlyData} />
      <CategoryBreakdown categorySummary={categorySummary} />
    </DashboardLayout>
  )
}
