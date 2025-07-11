"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ExpenseFiltersProps {
  searchTerm: string
  selectedMonth: string
  selectedCategory: string
  availableMonths: string[]
  availableCategories: string[]
  onSearchChange: (value: string) => void
  onMonthChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onClearFilters: () => void
}

export function ExpenseFilters({
  searchTerm,
  selectedMonth,
  selectedCategory,
  availableMonths,
  availableCategories,
  onSearchChange,
  onMonthChange,
  onCategoryChange,
  onClearFilters,
}: ExpenseFiltersProps) {
  const getMonthLabel = (monthValue: string) => {
    const [year, month] = monthValue.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filtres</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Recherche</Label>
            <Input
              id="search"
              type="text"
              placeholder="Titre ou catégorie..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="month">Mois</Label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les mois</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {getMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="category">Catégorie</Label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {availableCategories.map((categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={onClearFilters} variant="outline" className="w-full bg-transparent">
              Effacer les filtres
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
