"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Category {
  id: number
  name: string
  description?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    loadCategories(token)
  }, [router])

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("")
        setSuccessMessage("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage, successMessage])

  const loadCategories = async (token: string) => {
    try {
      const res = await fetch("http://localhost:3001/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    if (!token || !newCategory.trim()) return

    setErrorMessage("")
    setSuccessMessage("")

    try {
      const res = await fetch("http://localhost:3001/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setCategories([...categories, data])
        setNewCategory("")
        setShowForm(false)
        setSuccessMessage("Catégorie ajoutée avec succès !")
      } else {
        const errorData = await res.json()
        setErrorMessage(errorData.message || "Erreur lors de l'ajout de la catégorie")
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error)
      setErrorMessage("Erreur réseau lors de l'ajout")
    }
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setEditName(category.name)
    setErrorMessage("")
    setSuccessMessage("")
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setEditName("")
  }

  const saveEdit = async () => {
    if (!editingCategory || !editName.trim()) return

    const token = localStorage.getItem("token")
    if (!token) return

    setErrorMessage("")
    setSuccessMessage("")

    try {
      const res = await fetch(`http://localhost:3001/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      })

      if (res.ok) {
        const updatedCategory = await res.json()
        setCategories(categories.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat)))
        setEditingCategory(null)
        setEditName("")
        setSuccessMessage("Catégorie modifiée avec succès !")
      } else {
        const errorData = await res.json()
        setErrorMessage(errorData.message || "Erreur lors de la modification")
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error)
      setErrorMessage("Erreur réseau lors de la modification")
    }
  }

  const deleteCategory = async (id: number, categoryName: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) return

    setErrorMessage("")
    setSuccessMessage("")

    try {
      const res = await fetch(`http://localhost:3001/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setCategories(categories.filter((cat) => cat.id !== id))
        setSuccessMessage(`Catégorie "${categoryName}" supprimée avec succès !`)
      } else {
        const errorData = await res.json()

        if (res.status === 409) {
          setErrorMessage(
            `Impossible de supprimer la catégorie "${categoryName}" car elle est liée à des transactions. Supprimez d'abord les dépenses associées.`,
          )
        } else {
          setErrorMessage(errorData.message || "Erreur lors de la suppression")
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      setErrorMessage("Erreur réseau lors de la suppression")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">BudgetFlow</h1>
          <nav className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              Tableau de bord
            </Link>
            <Link href="/expenses" className="text-gray-600 hover:text-blue-600">
              Dépenses
            </Link>
            <Link href="/categories" className="text-blue-600 font-medium">
              Catégories
            </Link>
            <Link href="/summary" className="text-gray-600 hover:text-blue-600">
              Résumés
            </Link>
          </nav>
          <Button onClick={() => localStorage.removeItem("token") || router.push("/")} variant="outline" size="sm">
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mes Catégories</h2>
            <p className="text-gray-600 mt-1">Organisez vos dépenses par catégorie</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>➕ Nouvelle catégorie</Button>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ajouter une catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addCategory} className="flex space-x-4">
                <Input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nom de la catégorie"
                  className="flex-1"
                  required
                />
                <Button type="submit">Ajouter</Button>
                <Button type="button" onClick={() => setShowForm(false)} variant="outline">
                  Annuler
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  {editingCategory?.id === category.id ? (
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <Button onClick={saveEdit} size="sm" className="flex-1">
                          Sauvegarder
                        </Button>
                        <Button onClick={cancelEdit} variant="outline" size="sm" className="flex-1 bg-transparent">
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        {category.description && <p className="text-sm text-gray-500 mt-1">{category.description}</p>}
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <Button onClick={() => startEdit(category)} variant="outline" size="sm" title="Modifier">
                          ✏️
                        </Button>
                        <Button
                          onClick={() => deleteCategory(category.id, category.name)}
                          variant="destructive"
                          size="sm"
                          title="Supprimer"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">Aucune catégorie trouvée</p>
                  <Button onClick={() => setShowForm(true)}>Créer votre première catégorie</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
