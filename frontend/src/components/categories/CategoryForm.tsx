"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CategoryFormProps {
  onSubmit: (name: string) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({ onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onSubmit(name.trim())
      setName("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Ajouter une catégorie</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la catégorie"
            className="flex-1"
            required
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Ajout..." : "Ajouter"}
          </Button>
          <Button type="button" onClick={onCancel} variant="outline">
            Annuler
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
