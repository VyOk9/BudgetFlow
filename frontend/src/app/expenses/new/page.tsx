"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NewExpensePage() {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch("http://localhost:3001/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          amount: Number.parseFloat(amount),
          category,
          type: "expense",
          date,
        }),
      })

      if (res.ok) {
        setMessage("Dépense ajoutée avec succès !")
        setMessageType("success")

        setTitle("")
        setAmount("")
        setCategory("")
        setDate(new Date().toISOString().split("T")[0])

        window.dispatchEvent(new CustomEvent("expenseAdded"))

        setTimeout(() => {
          router.push("/expenses")
        }, 1500)
      } else {
        const data = await res.json()
        setMessage(data.message || "Erreur lors de l'ajout")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("Erreur réseau")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">BudgetFlow</h1>
          <Link href="/expenses" className="text-blue-600 hover:underline">
            ← Retour aux dépenses
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
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
                <div
                  className={`mt-4 p-3 rounded-md ${
                    messageType === "success"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p className={`text-sm ${messageType === "success" ? "text-green-800" : "text-red-800"}`}>
                    {message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
