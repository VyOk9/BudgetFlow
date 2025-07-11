"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryStatsProps {
  totalExpenses: number
  expenseCount: number
}

export function SummaryStats({ totalExpenses, expenseCount }: SummaryStatsProps) {
  return (
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
          <p className="text-sm text-gray-500 mt-2">Basé sur {expenseCount} transaction(s)</p>
        </div>
      </CardContent>
    </Card>
  )
}
