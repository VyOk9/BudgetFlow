export interface User {
    id: number
    email: string
    createdAt: string
  }

  export interface Category {
    id: number
    name: string
    description?: string
  }

  export interface Expense {
    id: number
    title: string
    amount: number
    category: Category
    date: string
    type: "expense"
  }

  export interface CategorySummary {
    category: string
    total: number
    percentage: number
  }

  export interface MonthlyData {
    month: string
    total: number
  }

  export interface ApiResponse<T> {
    data?: T
    message?: string
    error?: string
  }

  export interface AuthResponse {
    access_token: string
    user: User
  }
