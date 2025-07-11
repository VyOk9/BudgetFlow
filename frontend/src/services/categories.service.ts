import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/constants"
import type { Category } from "@/types"

export class CategoriesService {
  static async getAll(): Promise<Category[]> {
    return apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES)
  }

  static async create(name: string): Promise<Category> {
    return apiClient.post<Category>(API_ENDPOINTS.CATEGORIES, { name })
  }

  static async update(id: number, name: string): Promise<Category> {
    return apiClient.put<Category>(`${API_ENDPOINTS.CATEGORIES}/${id}`, { name })
  }

  static async delete(id: number): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`${API_ENDPOINTS.CATEGORIES}/${id}`)
  }
}
