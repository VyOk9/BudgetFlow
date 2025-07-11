"use client"

import { Button } from "@/components/ui/button"
import type { Expense, CategorySummary } from "@/types"

interface ExportActionsProps {
  expenses: Expense[]
  categorySummary: CategorySummary[]
  totalExpenses: number
  disabled?: boolean
}

export function ExportActions({ expenses, categorySummary, totalExpenses, disabled = false }: ExportActionsProps) {
  const exportToCSV = () => {
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
    link.setAttribute("download", `depenses_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generatePDF = () => {
    const htmlContent = createPDFContent(expenses, categorySummary, totalExpenses)
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `resume_depenses_${new Date().toISOString().split("T")[0]}.html`
    link.style.display = "none"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <Button onClick={exportToCSV} variant="outline" disabled={disabled}>
        📊 Export CSV
      </Button>
      <Button onClick={generatePDF} variant="outline" disabled={disabled}>
        📄 Télécharger PDF
      </Button>
    </div>
  )
}

function createPDFContent(expenses: Expense[], categorySummary: CategorySummary[], totalExpenses: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Résumé des Dépenses - BudgetFlow</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
          }
          h1 { 
            color: #2563eb; 
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
          }
          h2 { 
            color: #1f2937; 
            margin-top: 30px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #f8fafc; 
            font-weight: bold;
          }
          .total { 
            font-weight: bold; 
            color: #dc2626; 
            font-size: 1.2em;
          }
          .summary-box {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .date {
            text-align: right;
            color: #6b7280;
            font-size: 0.9em;
            margin-bottom: 20px;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
        </style>
      </head>
      <body>
        <div class="date">Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</div>
        
        <h1>📊 Résumé des Dépenses - BudgetFlow</h1>
        
        <div class="summary-box">
          <h3>💰 Total des dépenses</h3>
          <p class="total">${totalExpenses.toFixed(2)} €</p>
          <p>Basé sur ${expenses.length} transaction(s)</p>
        </div>
        
        <h2>📁 Dépenses par Catégorie</h2>
        <table>
          <thead>
            <tr>
              <th>Catégorie</th>
              <th>Montant</th>
              <th>Pourcentage</th>
            </tr>
          </thead>
          <tbody>
            ${categorySummary
              .map(
                (item) =>
                  `<tr>
                    <td>${item.category}</td>
                    <td>${item.total.toFixed(2)} €</td>
                    <td>${item.percentage.toFixed(1)}%</td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>

        <h2>📋 Détail de toutes les Dépenses</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Titre</th>
              <th>Catégorie</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            ${expenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(
                (expense) =>
                  `<tr>
                    <td>${new Date(expense.date).toLocaleDateString("fr-FR")}</td>
                    <td>${expense.title}</td>
                    <td>${expense.category.name}</td>
                    <td>${expense.amount.toFixed(2)} €</td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
        
        <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 0.9em;">
          <p>Document généré automatiquement par BudgetFlow</p>
        </div>
      </body>
    </html>
  `
}
