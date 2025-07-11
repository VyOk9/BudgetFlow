import { apiClient } from "@/lib/api"
import { API_ENDPOINTS, STORAGE_KEYS } from "@/constants"
import type { AuthResponse, User } from "@/types"

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    })

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
      localStorage.setItem(STORAGE_KEYS.IS_NEW_LOGIN, "true")
    }
    return response
  }

  static async signup(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post<User>(API_ENDPOINTS.AUTH.SIGNUP, { email, password })
      return response
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Signup failed")
    }
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.IS_NEW_LOGIN)
    }
  }

  static getStoredUser(): User | null {
    if (typeof window === "undefined") return null

    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("AuthService - Erreur lors de la récupération de l'utilisateur:", error)
      return null
    }
  }

  static getToken(): string | null {
    if (typeof window === "undefined") return null

    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN)
    } catch (error) {
      console.error("AuthService - Erreur lors de la récupération du token:", error)
      return null
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getStoredUser()
    const isAuth = !!(token && user)
    return isAuth
  }

  static isNewLogin(): boolean {
    if (typeof window === "undefined") return false
    return localStorage.getItem(STORAGE_KEYS.IS_NEW_LOGIN) === "true"
  }

  static clearNewLoginFlag(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.IS_NEW_LOGIN)
    }
  }
}
