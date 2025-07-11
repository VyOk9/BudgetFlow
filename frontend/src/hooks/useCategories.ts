"use client"

import { useState, useEffect, useCallback } from "react"
import { CategoriesService } from "@/services/categories.service"
import type { Category } from "@/types"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const data = await CategoriesService.getAll()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  const addCategory = async (name: string) => {
    try {
      const newCategory = await CategoriesService.create(name)
      setCategories((prev) => [...prev, newCategory])
      return newCategory
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erreur lors de l'ajout")
    }
  }

  const updateCategory = async (id: number, name: string) => {
    try {
      const updatedCategory = await CategoriesService.update(id, name)
      setCategories((prev) => prev.map((cat) => (cat.id === id ? updatedCategory : cat)))
      return updatedCategory
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erreur lors de la modification")
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      await CategoriesService.delete(id)
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
    } catch (err) {
      if (err instanceof Error && err.message.includes("liée à des transactions")) {
        throw new Error(err.message)
      }
      throw new Error(err instanceof Error ? err.message : "Erreur lors de la suppression")
    }
  }

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: loadCategories,
  }
}
