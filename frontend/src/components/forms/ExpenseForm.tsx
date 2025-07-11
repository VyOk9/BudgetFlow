"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertMessage } from "@/components/common/AlertMessage"

interface ExpenseFormProps {
  onSubmit: (data: {
    title: string
    amount: number
    category: string
    date: string
  }) => Promise<void>
  loading?: boolean
}

export function ExpenseForm({ onSubmit, loading = false }: ExpenseFormProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    try {
      await onSubmit({
        title,
        amount: Number.parseFloat(amount),
        category,
        date,
      })

      setMessage("Dépense ajoutée avec succès !")
      setMessageType("success")

      setTitle("")
      setAmount("")
      setCategory("")
      setDate(new Date().toISOString().split("T")[0])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur lors de l'ajout")
      setMessageType("error")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle Dépense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Courses alimentaires"
            />
          </div>

          <div>
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="Ex: Alimentation, Transport..."
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Ajout en cours..." : "Ajouter la dépense"}
          </Button>
        </form>

        {message && (
          <div className="mt-4">
            <AlertMessage type={messageType} message={message} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
