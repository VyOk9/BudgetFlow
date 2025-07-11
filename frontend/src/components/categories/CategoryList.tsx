"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Category } from "@/types"

interface CategoryListProps {
  categories: Category[]
  editingCategory: Category | null
  editName: string
  onStartEdit: (category: Category) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onEditNameChange: (name: string) => void
  onDelete: (id: number, name: string) => void
  onShowForm: () => void
}

export function CategoryList({
  categories,
  editingCategory,
  editName,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onDelete,
  onShowForm,
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="col-span-full">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucune catégorie trouvée</p>
            <Button onClick={onShowForm}>Créer votre première catégorie</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          isEditing={editingCategory?.id === category.id}
          editName={editName}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          onEditNameChange={onEditNameChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

interface CategoryItemProps {
  category: Category
  isEditing: boolean
  editName: string
  onStartEdit: (category: Category) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onEditNameChange: (name: string) => void
  onDelete: (id: number, name: string) => void
}

function CategoryItem({
  category,
  isEditing,
  editName,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onDelete,
}: CategoryItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        {isEditing ? (
          <EditMode
            editName={editName}
            onEditNameChange={onEditNameChange}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <ViewMode category={category} onStartEdit={onStartEdit} onDelete={onDelete} />
        )}
      </CardContent>
    </Card>
  )
}

function EditMode({
  editName,
  onEditNameChange,
  onSave,
  onCancel,
}: {
  editName: string
  onEditNameChange: (name: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-3">
      <Input
        type="text"
        value={editName}
        onChange={(e) => onEditNameChange(e.target.value)}
        className="w-full"
        autoFocus
      />
      <div className="flex space-x-2">
        <Button onClick={onSave} size="sm" className="flex-1">
          Sauvegarder
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm" className="flex-1 bg-transparent">
          Annuler
        </Button>
      </div>
    </div>
  )
}

function ViewMode({
  category,
  onStartEdit,
  onDelete,
}: {
  category: Category
  onStartEdit: (category: Category) => void
  onDelete: (id: number, name: string) => void
}) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{category.name}</h3>
        {category.description && <p className="text-sm text-gray-500 mt-1">{category.description}</p>}
      </div>
      <div className="flex space-x-2 ml-2">
        <Button onClick={() => onStartEdit(category)} variant="outline" size="sm" title="Modifier">
          ✏️
        </Button>
        <Button onClick={() => onDelete(category.id, category.name)} variant="destructive" size="sm" title="Supprimer">
          🗑️
        </Button>
      </div>
    </div>
  )
}
