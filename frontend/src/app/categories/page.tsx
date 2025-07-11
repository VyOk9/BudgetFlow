"use client"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { AlertMessage } from "@/components/common/AlertMessage"
import { CategoryForm } from "@/components/categories/CategoryForm"
import { CategoryList } from "@/components/categories/CategoryList"
import { Button } from "@/components/ui/button"
import { useCategories } from "@/hooks/useCategories"
import type { Category } from "@/types"

export default function CategoriesPage() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("")
        setSuccessMessage("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage, successMessage])

  const handleAddCategory = async (name: string) => {
    try {
      setErrorMessage("")
      setSuccessMessage("")
      await addCategory(name)
      setShowForm(false)
      setSuccessMessage("Catégorie ajoutée avec succès !")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erreur lors de l'ajout")
    }
  }

  const handleStartEdit = (category: Category) => {
    setEditingCategory(category)
    setEditName(category.name)
    setErrorMessage("")
    setSuccessMessage("")
  }

  const handleSaveEdit = async () => {
    if (!editingCategory || !editName.trim()) return

    try {
      setErrorMessage("")
      setSuccessMessage("")
      await updateCategory(editingCategory.id, editName.trim())
      setEditingCategory(null)
      setEditName("")
      setSuccessMessage("Catégorie modifiée avec succès !")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erreur lors de la modification")
    }
  }

  const handleDelete = async (id: number, categoryName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) return

    try {
      setErrorMessage("")
      setSuccessMessage("")
      await deleteCategory(id)
      setSuccessMessage(`Catégorie "${categoryName}" supprimée avec succès !`)
    } catch (error) {
      if (error instanceof Error && error.message.includes("liée à des transactions")) {
        setErrorMessage(
          `Impossible de supprimer la catégorie "${categoryName}" car elle est liée à des transactions. Supprimez d'abord les dépenses associées.`,
        )
      } else {
        setErrorMessage(error instanceof Error ? error.message : "Erreur lors de la suppression")
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout currentPage="categories">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Chargement des catégories..." />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPage="categories">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mes Catégories</h2>
          <p className="text-gray-600 mt-1">Organisez vos dépenses par catégorie</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>➕ Nouvelle catégorie</Button>
      </div>

      {errorMessage && (
        <div className="mb-6">
          <AlertMessage type="error" message={errorMessage} />
        </div>
      )}

      {successMessage && (
        <div className="mb-6">
          <AlertMessage type="success" message={successMessage} />
        </div>
      )}

      {showForm && <CategoryForm onSubmit={handleAddCategory} onCancel={() => setShowForm(false)} />}

      <CategoryList
        categories={categories}
        editingCategory={editingCategory}
        editName={editName}
        onStartEdit={handleStartEdit}
        onCancelEdit={() => setEditingCategory(null)}
        onSaveEdit={handleSaveEdit}
        onEditNameChange={setEditName}
        onDelete={handleDelete}
        onShowForm={() => setShowForm(true)}
      />
    </DashboardLayout>
  )
}
