"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { COLORS } from "@/constants"
import type { CategorySummary } from "@/types"

interface CategoryBreakdownProps {
  categorySummary: CategorySummary[]
}

export function CategoryBreakdown({ categorySummary }: CategoryBreakdownProps) {
  return (
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
              <CategoryItem key={index} item={item} color={COLORS[index % COLORS.length]} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">Aucune donnée de catégorie disponible</p>
        )}
      </CardContent>
    </Card>
  )
}

function CategoryItem({ item, color }: { item: CategorySummary; color: string }) {
  return (
    <div className="space-y-2">
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
            backgroundColor: color,
          }}
        ></div>
      </div>
    </div>
  )
}
