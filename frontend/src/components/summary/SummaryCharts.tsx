"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { COLORS } from "@/constants"
import type { CategorySummary, MonthlyData } from "@/types"

interface SummaryChartsProps {
  categorySummary: CategorySummary[]
  monthlyData: MonthlyData[]
}

export function SummaryCharts({ categorySummary, monthlyData }: SummaryChartsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <CategoryPieChart categorySummary={categorySummary} />
      <MonthlyBarChart monthlyData={monthlyData} />
    </div>
  )
}

function CategoryPieChart({ categorySummary }: { categorySummary: CategorySummary[] }) {
  return (
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
  )
}

function MonthlyBarChart({ monthlyData }: { monthlyData: MonthlyData[] }) {
  return (
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
  )
}
